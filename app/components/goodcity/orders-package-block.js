import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "../../mixins/async";

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

const ACTIVE_ORDER_STATES = [
  "submitted",
  "processing",
  "awaiting_dispatch",
  "dispatching"
];

const FORCE_DISABLE = ["edit_quantity"];

const CANCELLED = {};

/**
 * UI Component representing an orders_package
 *
 * --------------------------------------------------------
 * | op_state  |   order_code         order_state |    <  |
 * |           |                                  |  <    |
 * | qty       |   organisation                   |    <  |
 * --------------------------------------------------------
 *
 * It provides a drawer from the right side which is populated
 * with the actions provided by the backend
 *
 * Clicking on an action will run it on the API side
 *
 * @property {Model} orderPkg the orders_package to display
 *
 * Usage:
 *  {{goodcity/orders-package-block orderPkg=orderPkg }}
 */
export default Ember.Component.extend(AsyncMixin, {
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  intl: Ember.inject.service(),
  designationService: Ember.inject.service(),
  locationService: Ember.inject.service(),
  actionRunner: Ember.computed.alias("designationService"),

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
   * @todo
   * @returns {Promise<number>}
   */
  async selectQuantity() {
    throw new Error("Not implemennted");
  },

  /**
   * Given an actionn name, returns an object with all the required properties
   * to successfully
   *
   * CANCELLED if the user did not provide the
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
    const defaultMessage = this.get("intl").t("unexpected_error");
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
   */
  async runAction(actionName) {
    const params = await this.fulfillParams(actionName);
    const ordersPkg = this.get("orderPkg");
    const itemId = ordersPkg.get("itemId");

    if (params === CANCELLED) {
      return;
    }

    try {
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
    return this.get("intl").t(`orders_package.actions.${actionName}`);
  },

  iconFor(actionName) {
    return _.get(ACTIONS_SETTINGS, `${actionName}.icon`, []);
  },

  isDisabled(actionName) {
    return FORCE_DISABLE.includes(actionName);
  },

  actionList: Ember.computed(
    "orderPkg.id",
    "orderPkg.allowedActions.@each",
    "orderPkg.allowedActions.[]",
    function() {
      return this.getWithDefault("orderPkg.allowedActions", []).map(
        ({ name, enabled }) => ({
          label: this.labelFor(name),
          icon: this.iconFor(name),
          enabled: this.isDisabled(name) ? false : enabled,
          trigger: this.runAction.bind(this, name)
        })
      );
    }
  ),

  actions: {
    redirectToOrderDetail(orderId) {
      this.router.transitionTo("orders.detail", orderId);
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
