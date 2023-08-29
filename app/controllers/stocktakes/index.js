import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { ERROR_STRATEGIES } from "../../mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  // ----------------------
  // Dependencies
  // ----------------------

  locationService: Ember.inject.service(),
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  // ----------------------
  // Properties
  // ----------------------

  tabs: {
    open: "open",
    closed: "closed",
    cancelled: "cancelled"
  },

  stocktakes: Ember.computed(function() {
    return this.get("store").peekAll("stocktake");
  }),

  closedStocktakes: Ember.computed.filterBy("stocktakes", "state", "closed"),
  cancelledStocktakes: Ember.computed.filterBy(
    "stocktakes",
    "state",
    "cancelled"
  ),
  openStocktakes: Ember.computed.filterBy("stocktakes", "state", "open"),

  filteredStocktakes: Ember.computed(
    "selectedTab",
    "stocktakes.[]",
    "stocktakes.@each.state",
    function() {
      const tabs = this.get("tabs");

      const sorted = list => list.sortBy("id").reverse();

      const key = {
        [tabs.open]: "openStocktakes",
        [tabs.closed]: "closedStocktakes",
        [tabs.cancelled]: "cancelledStocktakes"
      }[this.get("selectedTab")];

      return sorted(this.getWithDefault(key, []));
    }
  ),

  showStocktakeList: Ember.computed.not("createMode"),
  showCreateForm: Ember.computed.alias("createMode"),

  stocktakeNameAlreadyExists: Ember.computed(
    "stocktakes.[]",
    "stocktakes.@each.name",
    "newStocktakeName",
    function() {
      const name = this.get("newStocktakeName");
      return !!this.get("stocktakes").findBy("name", name);
    }
  ),

  stocktakeAtLocationAlreadyExists: Ember.computed(
    "selectedLocation",
    "stocktakes.[]",
    "stocktakes.@each.{location,state}",
    function() {
      return !!this.get("stocktakes")
        .filterBy("isOpen")
        .findBy("location", this.get("selectedLocation"));
    }
  ),

  missingStocktakeName: Ember.computed("newStocktakeName", function() {
    return (this.get("newStocktakeName") || "").trim().length === 0;
  }),
  invalidStocktakeName: Ember.computed.or(
    "stocktakeNameAlreadyExists",
    "missingStocktakeName"
  ),
  invalidLocation: Ember.computed.empty("selectedLocation"),

  // ----------------------
  // Lifecycle
  // ----------------------

  init() {
    this._super(...arguments);
    this.set("selectedTab", this.get("tabs.open"));
  },

  on() {
    this.resetState();
  },

  off() {
    this.resetState();
  },

  // ----------------------
  // Helpers
  // ----------------------

  generateStocktakeName(location) {
    if (!location) return "";

    return `Stocktake - ${location.get("displayName")} - ${moment().format(
      "MMMM YYYY"
    )}`;
  },

  async resetState() {
    this.set("selectedLocation", null);
    this.set("newStocktakeName", "");
    this.set("newStocktakeComment", "");
    this.set("createMode", false);
  },

  async pickLocation() {
    const headerText = this.get("i18n").t("stocktakes.select_location");
    const location = await this.get("locationService").userPickLocation({
      headerText
    });

    if (location) {
      this.set("selectedLocation", location);
      this.set("newStocktakeName", this.generateStocktakeName(location));
    }

    return location;
  },

  // ----------------------
  // Actions
  // ----------------------

  actions: {
    selectTab(tab) {
      this.runTask(async () => {
        this.set(
          "stocktakes",
          await this.store.query("stocktake", {
            include_revisions: false,
            state: tab
          })
        );
        this.set("selectedTab", tab);
      });
    },

    pickLocation() {
      return this.pickLocation();
    },

    async cancelCreate() {
      this.set("selectedLocation", null);
      this.set("createMode", false);
    },

    async confirmNewStocktake() {
      this.runTask(async () => {
        const stocktake = this.get("store").createRecord("stocktake", {
          name: this.get("newStocktakeName").trim(),
          location: this.get("selectedLocation"),
          comment: this.get("newStocktakeComment"),
          state: "open"
        });

        await stocktake.save();

        this.resetState();
        this.transitionToRoute("stocktakes.detail", stocktake.get("id"));
      }, ERROR_STRATEGIES.MODAL);
    },

    async initNewStocktake() {
      const location = await this.pickLocation();

      if (!location) return;

      this.set("createMode", true);
      this.set("newStocktakeComment", "");
    }
  }
});
