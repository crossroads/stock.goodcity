import Ember from "ember";
import ApiBaseService from "./api-base-service";
import NavigationAwareness from "../mixins/navigation_aware";
import _ from "lodash";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

import { ACTIVE_ORDER_STATES } from "../constants/states";

function ID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}

/**
 * Designation Service
 *
 * @module Services/DesignationService
 * @augments Services/ApiBaseService
 * @description Control of designation of packages to orders
 * <br> Notes:
 * <br> * Stock currently use the 'designation' model, which in reality is
 * <br> the 'order' model. We're trying to move away from this model name.
 * <br>
 * <br> * 'Designation' here refers to the assignment of a package to an order
 * <br> which mostly involves operations on the orders_package join table
 *
 */
export default ApiBaseService.extend(NavigationAwareness, AsyncMixin, {
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openOrderSearch", false);
  },

  editableQty: Ember.computed.alias("settings.allowPartialOperations"),

  /**
   * Runs a remote action on the specified orders_package
   *
   * @param {String|Model} ordersPackage
   * @param {Stirng} actionName
   * @param {Object} [params={}]
   * @returns {Promise<Model>}
   */
  async execAction(ordersPackage, actionName, params = {}) {
    const id = ID(ordersPackage);
    const url = `/orders_packages/${id}/actions/${actionName}`;

    const data = await this.PUT(url, params);

    this.get("store").pushPayload(data);
    return this.get("store").peekRecord("orders_package", id);
  },

  /**
   * Cancels an orders_package
   * Shorthand for execAction(..., 'cancel')
   *
   * @param {String|Model} ordersPackage
   * @returns {Promise<Model>}
   */
  cancel(ordersPackage) {
    return this.execAction(ordersPackage, "cancel");
  },

  /**
   * Dispatches an orders_package
   * Shorthand for execAction(..., 'dispatch')
   *
   * @param {String|Model} ordersPackage
   * @param {object} params
   * @param {string|Model} params.from_location the location to dispatch from
   * @returns {Promise<Model>}
   */
  dispatch(ordersPackage, { from_location, quantity }) {
    return this.execAction(ordersPackage, "dispatch", {
      location_id: ID(from_location),
      quantity: Number(quantity)
    });
  },

  /**
   * Undispatches an orders_package
   * Shorthand for execAction(..., 'undispatch')
   *
   * @param {String|Model} ordersPackage
   * @returns {Promise<Model>}
   */
  undispatch(ordersPackage) {
    return this.execAction(ordersPackage, "undispatch");
  },

  /**
   * Redesignates the orders_package to a different order
   * Shorthand for execAction(..., 'redesignate')
   *
   * @param {String|Model} ordersPackage The orders_package to update (or its ID)
   * @param {String|Model} newOrder The new order to designate to (or its ID)
   * @returns {Promise<Model>}
   */
  redesignate(ordersPackage) {
    return this.execAction(ordersPackage, "redesignate", {
      order_id: ordersPackage.get("orderId")
    });
  },

  /**
   * Modifies the quantity of packages needed for the order
   * Shorthand for execAction(..., 'edit_quantity')
   *
   * @param {String|Model} ordersPackage The orders_package to update (or its ID)
   * @param {Number} quantity The new quantity
   * @returns {Promise<Model>}
   */
  editQuantity(ordersPackage, quantity) {
    return this.execAction(ordersPackage, "undispatch", { quantity });
  },

  /**
   * Designate a quantity of a package to an order
   *
   * @param {String|Model} pkg The package to designate
   * @param {String|Model} order The order to designate to
   * @param {Number} quantity The quantity to designate
   * @returns {Promise<Model>}
   */
  async designate(pkg, { order, quantity, shippingNumber }) {
    const id = ID(pkg);
    const url = `/packages/${id}/designate`;

    const data = await this.PUT(url, {
      order_id: ID(order),
      quantity: quantity,
      shipping_number: shippingNumber
    });

    this.get("store").pushPayload(data);
    return this.get("store").peekRecord("package", id);
  },

  /**
   * Triggers the order selection popup, and resolves the promise
   * once an order has been selected.
   *
   * null is returned if the user closes the UI
   *
   * @returns {Promise<Model>}
   */
  userPickOrder(filters = {}) {
    const deferred = Ember.RSVP.defer();

    this.set("orderSearchProps", filters);
    this.set("openOrderSearch", true);
    this.set("onOrderSelected", order => {
      this.set("onOrderSelected", _.noop);
      this.set("openOrderSearch", false);
      deferred.resolve(order || null);
    });

    return deferred.promise;
  },

  /**
   * Updates Beneficiary
   *
   * @param {String|Model} beneficiary
   * @param {object} params
   * @returns {Promise<Model>}
   */
  updateBeneficiary(beneficiary, params) {
    const id = ID(beneficiary);
    const url = `/beneficiaries/${id}`;
    return this.PUT(url, params);
  },

  async resolveOrder(order) {
    return (
      order ||
      this.userPickOrder({
        state: ACTIVE_ORDER_STATES.join(",")
      })
    );
  },

  beginDesignation(options) {
    let pkg = options.pkg,
      order = options.order;

    this.set("allowItemChange", options.allowItemChange);
    this.set("allowOrderChange", options.allowOrderChange);

    if (pkg.get("availableQuantity") > 0 || options.isEditOperation) {
      this.triggerDesignateAction(pkg, order);
    } else {
      this.set("designationTargetPackage", pkg);
      this.set("displayDesignateForm", true);
      this.set("showItemAvailability", true);
    }
  },

  triggerDesignateAction(pkg, order) {
    this.resolveOrder(order).then(target => {
      if (target) {
        this.set("designationTargetPackage", pkg);
        this.set("designationTargetOrder", target);
        this.computeDesignationQuantities();
        this.set("displayDesignateForm", true);
        this.set("readyToDesignate", true);
      }
    });
  },

  triggerOrderChange(pkg, order) {
    if (this.get("allowOrderChange")) {
      this.triggerDesignateAction(pkg, order);
    }
  },

  triggerItemChange() {
    if (this.get("allowItemChange")) {
      this.set("readyToDesignate", false);
    }
  },

  computeDesignationQuantities() {
    const pkg = this.get("designationTargetPackage");
    const order = this.get("designationTargetOrder");

    if (!order || !pkg) {
      this.set("designatableQuantity", 0);
      this.set("designationQty", 0);
      return;
    }

    const maxQuantity =
      pkg.get("availableQuantity") + this.alreadyDesignatedQuantity(pkg, order);

    this.set("designatableQuantity", maxQuantity);
    if (!this.get("designationQty")) {
      this.set("designationQty", maxQuantity);
    }
  },

  alreadyDesignatedQuantity(pkg, order) {
    const ordPkg = pkg.get("ordersPackages").find(op => {
      return parseInt(op.get("orderId")) === parseInt(order.get("id"));
    });
    return ordPkg && ordPkg.get("isDesignated") ? ordPkg.get("quantity") : 0;
  },

  resetOrderDesignation() {
    this.set("readyToDesignate", false);
    this.set("designatableQuantity", 0);
    this.set("designationTargetPackage", null);
    this.set("designationTargetOrder", null);
    this.set("designationQty", 0);
    this.set("shippingNumber", "");
  },

  completeDesignation() {
    if (!this.get("readyToDesignate")) return;

    this.runTask(() => {
      const pkg = this.get("designationTargetPackage");
      const order = this.get("designationTargetOrder");
      const quantity = this.get("designationQty");
      const shippingNumber = this.get("shippingNumber");

      return this.designate(pkg, {
        order,
        quantity,
        shippingNumber
      });
    }, ERROR_STRATEGIES.MODAL).finally(() => {
      this.resetOrderDesignation();
    });
  },

  onNavigation() {
    this.getWithDefault("onOrderSelected", _.noop)(null);
    this.set("readyToDesignate", false);
    this.set("showItemAvailability", false);
  }
});
