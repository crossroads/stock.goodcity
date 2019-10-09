import Ember from "ember";
import _ from "lodash";

const ACTIONS_SETTINGS = {
  dispatch: {
    icon: "paper-plane"
  },
  cancel: {
    icon: "times-circle"
  },
  undispatch: {
    icon: "reply"
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
 * -----------------------------------------------------
 * |  ico   |   order code                     |    <  |
 * |        |                                  |  <    |
 * |  qty   |   organisation                   |    <  |
 * -----------------------------------------------------
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
export default Ember.Component.extend({
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  actionRunner: Ember.inject.service("designationService"),
  orderSearchProps: {
    state: ACTIVE_ORDER_STATES.join(",")
  },

  init() {
    this._super(...arguments);
    this.set("paramGetters", {
      order_id: "selectOrder",
      quantity: "selectQuantity"
    });
  },

  // --- PARAMS RESOLUTION

  /**
   * Triggers the order selection popup, and resolves the promise
   * once an order has been selected.
   *
   * CANCELLED is returned if the user closes the UI
   *
   * @returns {Promise<Model>}
   */
  selectOrder() {
    const deferred = Ember.RSVP.defer();

    this.set("openOrderSearch", true);
    this.set("orderSelected", order => {
      deferred.resolve(order ? order.get("id") : CANCELLED);
      this.set("orderSelected", _.noop);
    });

    return deferred.promise;
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

  showSpinner() {
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  hideSpinner() {
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

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
   */
  async runAction(actionName) {
    const params = await this.fulfillParams(actionName);
    const ordersPkg = this.get("orderPkg");

    if (params === CANCELLED) {
      return;
    }

    this.showSpinner();

    try {
      await this.get("actionRunner").execAction(ordersPkg, actionName, params);
      this.hideSpinner();
    } catch (e) {
      this.hideSpinner();
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
  )
});
