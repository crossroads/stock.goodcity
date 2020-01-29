import { computed } from "@ember/object";
import { run } from "@ember/runloop";
import { defer } from "rsvp";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import _ from "lodash";
import AsyncMixin from "../../mixins/async";
import { ACTIVE_ORDER_STATES } from "../../constants/states";

const ACTIONS_SETTINGS = {
  dispatch: {
    icon: "paper-plane"
  },
  cancel: {
    icon: "times-circle"
  },
  undispatch: {
    icon: "reply",
    params: ["location_id"]
  },
  redesignate: {
    icon: "shopping-basket",
    params: ["order_id"]
  },
  edit_quantity: {
    icon: "edit",
    params: ["quantity"]
  }
};

const CANCELLED = {};

/**
 * UI Component representing an orders_package
 *
 *  --------------------------------------------------------
 *  | op_state  |   order_code         order_state |    <  |
 *  |           |                                  |  <    |
 *  | qty       |   organisation                   |    <  |
 *  --------------------------------------------------------
 *
 * @module Components/goodcity/orders-package-block
 * @augments ember/Component
 * @param {Model} orderPkg the orders_package to display
 * @description
 * <br> It provides a drawer from the right side which is populated
 * <br> with the actions provided by the backend
 * <br>
 * <br> Clicking on an action will run it on the API side
 *
 * @example
 *  {{goodcity/orders-package-block orderPkg=orderPkg }}
 */
export default Component.extend(AsyncMixin, {
  store: service(),
  messageBox: service(),
  i18n: service(),
  designationService: service(),
  locationService: service(),
  settings: service(),
  actionRunner: alias("designationService"),

  editableQty: alias("settings.allowPartialOperations"),
  drawerOpened: false,

  init() {
    this._super(...arguments);
    this.set("paramGetters", {
      order_id: "selectOrder",
      location_id: "selectLocation",
      quantity: "selectQuantity"
    });
  },

  // --- PARAMS RESOLUTION

  /**
   * Prompts the user to select an order, and returns its id
   *
   * CANCELLED is returned if the user closes the UI
   *
   * @private
   * @returns {Promise<String>}
   */
  async selectOrder() {
    const order = await this.get("designationService").userPickOrder({
      state: ACTIVE_ORDER_STATES.join(",")
    });

    return order ? order.get("id") : CANCELLED;
  },

  /**
   * Prompts the user to select a location, and returns its id
   *
   * CANCELLED is returned if the user closes the UI
   *
   * @private
   * @returns {Promise<String>}
   */
  async selectLocation() {
    const location = await this.get("locationService").userPickLocation();
    return location ? location.get("id") : CANCELLED;
  },

  /**
   * Opens a qty selection UI and resolves the promise with the desired
   * quanntity
   *
   * CANCELLED is returned if the user closes the UI
   *
   * @private
   * @returns {Promise<number>}
   */
  selectQuantity() {
    const deferred = defer();
    const maxQuantity =
      this.get("orderPkg.quantity") + this.get("orderPkg.item.availableQty");

    this.set(
      "designationQty",
      this.get("editableQty") ? maxQuantity : this.get("orderPkg.quantity")
    );
    this.set("designationTargetOrder", this.get("orderPkg.designation"));
    this.set("maxQuantity", maxQuantity);
    this.set("showQuantityInput", true);

    const answer = fn => () => {
      deferred.resolve(fn());
      this.set("showQuantityInput", false);
    };

    this.set(
      "completeQtyInput",
      answer(() => this.get("designationQty"))
    );
    this.set(
      "cancelQtyInput",
      answer(() => CANCELLED)
    );

    return deferred.promise;
  },

  /**
   * Given an actionn name, returns an object with all the required properties
   * to successfully
   *
   * CANCELLED if the user did not provide the
   *
   * @private
   * @memberof OrdersPackageBlock
   * @param {string} actionName the action being run
   * @returns the options to send to the api
   */
  async fulfillParams(actionName) {
    const paramNames = _.get(ACTIONS_SETTINGS, `${actionName}.params`, []);

    let params = {};
    for (let name of paramNames) {
      const getterName = this.getWithDefault(`paramGetters.${name}`, "");
      const val = await this[getterName]();

      if (val === CANCELLED) {
        return CANCELLED;
      }
      params[name] = val;
    }
    return params;
  },

  // --- EXECUTION

  onError(reason) {
    const defaultMessage = this.get("i18n").t("unexpected_error");
    const message = _.get(
      reason,
      "responseJSON.errors[0].message",
      defaultMessage
    );
    this.get("messageBox").alert(message);
  },

  /**
   * Runs the desired action
   *
   * @memberof OrdersPackageBlock
   * @private
   * @param {string} actionName the action to run
   * @returns {Promise<Package>} the updated package
   */
  async runAction(actionName) {
    const params = await this.fulfillParams(actionName);
    const ordersPkg = this.get("orderPkg");
    const itemId = ordersPkg.get("itemId");

    if (params === CANCELLED) {
      return;
    }

    try {
      run(() => this.set("drawerOpened", false));

      await this.runTask(
        this.get("actionRunner").execAction(ordersPkg, actionName, params)
      );

      return this.get("store").findRecord("item", itemId, { reload: true });
    } catch (e) {
      this.onError(e);
    }
  },

  // --- MENU

  labelFor(actionName) {
    return this.get("i18n").t(`orders_package.actions.${actionName}`);
  },

  iconFor(actionName) {
    return _.get(ACTIONS_SETTINGS, `${actionName}.icon`, []);
  },

  actionList: computed(
    "orderPkg.id",
    "orderPkg.allowedActions.@each",
    "orderPkg.allowedActions.[]",
    function() {
      const filter = ({ name }) => {
        if (this.get("actionsFilter")) {
          return this.get("actionsFilter").includes(name);
        }
        return true;
      };

      return this.getWithDefault("orderPkg.allowedActions", [])
        .filter(filter)
        .map(({ name, enabled }) => ({
          label: this.labelFor(name),
          icon: this.iconFor(name),
          enabled: enabled,
          trigger: this.runAction.bind(this, name)
        }));
    }
  ),

  actions: {
    redirectToOrderDetail(orderId) {
      this.router.transitionTo("orders.active_items", orderId);
    },

    redirectToItemDetails(itemId) {
      this.router.transitionTo("items.detail", itemId);
    },

    redirectToDetails() {
      if (this.get("packageView")) {
        this.send("redirectToItemDetails", this.get("orderPkg.item.id"));
      } else {
        this.send("redirectToOrderDetail", this.get("orderPkg.designation.id"));
      }
    }
  }
});
