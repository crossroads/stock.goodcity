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
  currentAction: "",

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

  // itemActions: {
  //   process: {
  //     name: "Process",
  //     icon: "random"
  //   },
  //   recycle: {
  //     name: "Recycle",
  //     icon: "recycle"
  //   },
  //   trash: {
  //     name: "Trash",
  //     icon: "dumpster"
  //   },
  //   loss: {
  //     name: "Loss",
  //     icon: "folder-minus"
  //   },
  // },

  actionQty: Ember.computed("_actionQty", {
    get(k) {
      return this.get("_actionQty");
    },
    set(k, value) {
      const allowPartial = this.get("settings.allowPartialOperations");
      const total = this.quantityAtSource();
      const qty = Number(value);

      if (!allowPartial && qty > 0 && qty !== total) {
        throw new Error("Partial quantity is not permitted");
      }

      this.set("_actionQty", qty);
      return qty;
    }
  }),

  async resolveLocation(pkg) {
    const presetLocations = pkg.get("packagesLocations").mapBy("location");

    if (presetLocations.get("length") > 1) {
      return this.get("locationService").userPickLocation({
        headerText: this.get("i18n").t("select_location.dispatch_from"),
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
      let from = await this.resolveLocation(pkg);

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
      this.set("actionName", actionName);
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
        return this.get("locationService").movePackage(
          this.get("actionTarget"),
          {
            from: this.get("actionFrom"),
            actionName: this.get("actionName"),
            quantity: this.get("actionQty")
          }
        );
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearActionParams();
      });
    },

    async cancelAction() {
      this.clearActionParams();
    }
  }
});
