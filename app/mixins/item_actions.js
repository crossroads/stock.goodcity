import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "./async";
import _ from "lodash";

/**
 * Adds the following properties:
 *
 * - readyForAction (computed, true if other proerties are valid)
 * - actionQty
 * - actionTarget (the package to move)
 * - actionFrom
 * - actionName
 * - editableQty
 *
 * Adds the following actions:
 *
 * - beginAction(package, from, action)
 * - completeAction()
 * - cancelAction()
 */

export default Ember.Mixin.create(AsyncMixin, {
  locationService: Ember.inject.service(),
  settings: Ember.inject.service(),
  editableQty: Ember.computed.alias("settings.allowPartialOperations"),

  itemActions: [
    {
      name: "Process",
      icon: "random"
    },
    {
      name: "Recycle",
      icon: "recycle"
    },
    {
      name: "Trash",
      icon: "dumpster"
    },
    {
      name: "Loss",
      icon: "folder-minus"
    }
  ],

  async resolveFromLocation(pkg) {
    const presetLocations = pkg.get("packagesLocations").mapBy("location");

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

  quantityAtSource() {
    const pkg = this.get("actionTarget");
    const source = this.get("actionFrom");

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

    return target && from && actionName && qty > 0;
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
      this.set("actionName", actionName);
      let from = await this.resolveFromLocation(pkg);

      if (!pkg || !actionName || !from) {
        return this.send("cancelAction");
      }

      this.set(
        "maxQuantity",
        pkg
          .get("packagesLocations")
          .filter(
            kk => kk.get("locationId") === parseInt(from.get("id"), 10)
          )[0]
          .get("quantity")
      );
      this.set("actionTarget", pkg);
      this.set("actionFrom", from);
      this.set("actionQty", this.quantityAtSource());
      this.set(
        "actionIcon",
        _.filter(this.get("itemActions"), {
          name: actionName
        })[0].icon
      );

      if (this.validActionParams()) {
        this.set("readyForAction", true);
        // this.set("readyToDispatch", true);
      } else {
        this.send("cancelAction");
      }
    },

    completeAction() {
      this.runTask(() => {
        return this.get("locationService").peformActionOnPackage(
          this.get("actionTarget"),
          {
            from: this.get("actionFrom"),
            actionName: this.get("actionName").toLowerCase(),
            quantity: this.get("actionQty"),
            description: this.get("description")
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
