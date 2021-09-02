import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "../../mixins/async";
import DispatchActions from "../../mixins/dispatch_actions";
import { ACTIVE_ORDER_STATES } from "../../constants/states";

const ACTIONS_SETTINGS = {
  dispatch: {
    icon: "paper-plane",
    customAction: "beginDispatch"
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
    customAction: "beginDesignation"
  },
  edit_quantity: {
    icon: "edit",
    customAction: "beginDesignation"
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
export default Ember.Component.extend(AsyncMixin, DispatchActions, {
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  designationService: Ember.inject.service(),
  locationService: Ember.inject.service(),
  settings: Ember.inject.service(),
  actionRunner: Ember.computed.alias("designationService"),

  editableQty: Ember.computed.alias("settings.allowPartialOperations"),
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
    const location = await this.get("locationService").userPickLocation({
      headerText: this.get("i18n").t("select_location.pick_to_location")
    });
    return location ? location.get("id") : CANCELLED;
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
    const ordersPkg = this.get("orderPkg");
    const customAction = _.get(
      ACTIONS_SETTINGS,
      `${actionName}.customAction`,
      null
    );

    if (customAction) {
      this.send("closeDrawer");
      return this.send(customAction, ordersPkg);
    }

    const params = await this.fulfillParams(actionName);
    const itemId = ordersPkg.get("itemId");

    if (params === CANCELLED) {
      return;
    }

    try {
      this.send("closeDrawer");

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

  actionList: Ember.computed(
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
          enabled: name === "redesignate" ? true : enabled,
          trigger: this.runAction.bind(this, name)
        }));
    }
  ),

  actions: {
    closeDrawer() {
      Ember.run(() => this.set("drawerOpened", false));
    },

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
    },

    beginDesignation(orderPkg) {
      this.get("designationService").beginDesignation({
        pkg: orderPkg.get("item"),
        order: orderPkg.get("designation"),
        isEditOperation: true,
        allowOrderChange: true
      });
    }
  }
});
