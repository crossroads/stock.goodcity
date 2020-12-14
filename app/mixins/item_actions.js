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

const TASK = {
  UNPACK: "unpack"
};

export default Ember.Mixin.create(AsyncMixin, {
  locationService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  settings: Ember.inject.service(),
  actionComment: "",
  i18n: Ember.inject.service(),

  selectedProcessingDestination: "",

  processingDestinations: Ember.computed(function() {
    const list = this.get("store")
      .peekAll("processing_destinations_lookup")
      .map(item => ({ id: item.get("id"), name: item.get("name") }));

    list.unshift({ id: null, name: "None" });
    return list;
  }),

  itemActions: Ember.computed(function() {
    return ITEM_ACTIONS.map(action => {
      return {
        ...action,
        displayName: this.get("i18n").t(
          `items.actions.${action.name.toLowerCase()}`
        ).string
      };
    });
  }),

  verifyGainAction(actionName) {
    let currentAction = _.find(this.get("itemActions"), ["name", actionName]);
    return currentAction && !currentAction.loss;
  },

  isValidQuantity: Ember.computed("actionQty", function() {
    let value = this.get("actionQty");
    return value > 0 && value <= this.get("maxQuantity");
  }),

  async resolveActionFromLocation(pkg, showAllLocations = false) {
    const presetLocations = await (showAllLocations
      ? this.get("store").query("location", {})
      : pkg.get("packagesLocations").mapBy("location"));

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

  /**
   * Unpacks the item from box / pallet
   * Updates the onHandBoxedQuantity / onHandPalletizedQuantity in store
   *
   * @param EmberObject container
   * @param EmberObject item
   * @param Integer location_id
   * @param Integer quantity
   * @param function callback
   */
  async unpack(container, item, location_id, quantity, callback) {
    if (!item) {
      throw new Error(this.get("i18n").t("box_pallet.bad_item"));
    }

    const params = {
      item_id: item.id,
      location_id: location_id,
      task: TASK.UNPACK,
      quantity: quantity
    };

    // 1. Make API request to remove item from the container
    this.get("packageService")
      .addRemoveItem(container.id, params)
      .then(async () => {
        this.get("packageService");

        // 2. Reload the model to sync all location and quantity data with API
        await item.reload();

        // 3. Invoke callback with parameters
        // item - The package record which is removed from the box
        // container - The package record from which the item is removed
        if (callback) {
          callback(item, container);
        }
      });
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
        if (pkg.get("isBoxPallet")) {
          this.set("maxQuantity", 1);
          this.set("actionQty", 1);
        } else {
          this.set("maxQuantity", 99999);
        }
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

    onProcessingDestinationChange(destination) {
      this.set("selectedProcessingDestination", destination);
    },

    completeAction() {
      this.runTask(() => {
        return this.get("packageService").peformActionOnPackage(
          this.get("actionTarget"),
          {
            from: this.get("actionFrom"),
            actionName: this.get("actionName").toLowerCase(),
            quantity: this.get("actionQty"),
            comment: this.get("actionComment"),
            processing_destination_lookup_id: this.get(
              "selectedProcessingDestination.id"
            )
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
