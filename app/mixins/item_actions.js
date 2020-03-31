import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "./async";
import _ from "lodash";
import { ITEM_ACTIONS } from "stock/constants/item-actions";

/**
 * Adds the following properties:
 *
 * - readyForAction (computed, true if other proerties are valid)
 * - actionQty
 * - actionTarget (the package to move)
 * - actionFrom
 * - actionName
 *
 * Adds the following actions:
 *
 * - beginAction(package, from, action)
 * - completeAction()
 * - cancelAction()
 */

export default Ember.Mixin.create(AsyncMixin, {
  locationService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  settings: Ember.inject.service(),
  actionComment: "",
  i18n: Ember.inject.service(),

  itemActions: Ember.computed(function() {
    let actionsList = ITEM_ACTIONS;
    actionsList.map(action => {
      action.displayName = this.get("i18n").t(
        `items.actions.${action.name.toLowerCase()}`
      ).string;
    });
    return actionsList;
  }),

  verifyGainAction(actionName) {
    let currentAction = _.find(
      this.get("itemActions"),
      action => action.name === actionName
    );
    return currentAction && !currentAction.loss;
  },

  isValidQuantity: Ember.computed("actionQty", "isGainAction", function() {
    let action = this.get("actionName");
    let isGainAction = this.get("isGainAction");
    let value = this.get("actionQty");
    return (
      (isGainAction && value > 0) ||
      (value > 0 && value <= this.get("maxQuantity"))
    );
  }),

  async resolveActionFromLocation(pkg, showAllLocations = false) {
    const presetLocations = showAllLocations
      ? this.get("store").peekAll("location")
      : pkg.get("packagesLocations").mapBy("location");

    if (presetLocations.get("length") > 1) {
      return this.get("locationService").userPickLocation({
        headerText: this.get("i18n").t(
          `select_location.${this.get("actionName").toLowerCase()}_from`
        ),
        presetLocations
      });
    }

    return presetLocations.get("firstObject");
  },

  quantityAtLocation(source) {
    const pkg = this.get("actionTarget");

    if (!pkg) {
      return 0;
    }

    const pkgLoc = pkg.get("packagesLocations").findBy("location", source);

    return pkgLoc ? pkgLoc.get("quantity") : 0;
  },

  validActionParams() {
    const target = this.get("actionTarget");
    const from = this.get("actionFrom");
    const actionName = this.get("actionName");
    const qty = this.get("actionQty");

    if (this.get("isGainAction")) {
      return target && from && actionName;
    } else {
      return target && from && actionName && qty > 0;
    }
  },

  clearActionParams() {
    this.set("readyForAction", false);
    this.set("actionQty", 0);
    this.set("actionTarget", null);
    this.set("actionFrom", null);
    this.set("actionName", null);
    this.set("actionIcon", null);
  },

  actions: {
    async beginAction(pkg, actionName) {
      let isGainAction = this.verifyGainAction(actionName);
      this.set("actionName", actionName);
      this.set("isGainAction", isGainAction);

      let from = await this.resolveActionFromLocation(pkg, isGainAction);

      if (!pkg || !actionName || !from) {
        return this.send("cancelAction");
      }

      this.set("actionTarget", pkg);
      this.set("actionFrom", from);
      this.set("actionComment", "");

      let quantity = this.quantityAtLocation(from);

      if (isGainAction) {
        this.set("maxQuantity", 99999);
      } else {
        this.set("maxQuantity", quantity);
        this.set("actionQty", quantity);
      }

      this.set(
        "actionIcon",
        _.filter(ITEM_ACTIONS, {
          name: actionName
        })[0].icon
      );

      if (this.validActionParams()) {
        this.set("readyForAction", true);
      } else {
        this.send("cancelAction");
      }
    },

    completeAction() {
      this.runTask(() => {
        return this.get("packageService").peformActionOnPackage(
          this.get("actionTarget"),
          {
            from: this.get("actionFrom"),
            actionName: this.get("actionName").toLowerCase(),
            quantity: this.get("actionQty"),
            comment: this.get("actionComment")
          }
        );
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearActionParams();
      });
    },

    async cancelAction() {
      this.clearActionParams();
    },

    async selectLocationAction() {
      this.send(
        "beginAction",
        this.get("actionTarget"),
        this.get("actionName")
      );
    }
  }
});
