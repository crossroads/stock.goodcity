import Ember from "ember";
import SearchOptionMixin from "stock/mixins/search_option";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import { regex } from "stock/constants/regex";

export default Ember.Controller.extend(SearchOptionMixin, AsyncMixin, {
  i18n: Ember.inject.service(),
  showError: false,
  orderService: Ember.inject.service(),

  shipmentorCarryoutCode: Ember.computed({
    get() {
      return this.get("shipmentorCarryoutCode");
    },
    set(_, value) {
      return value;
    }
  }),

  isInvalidDescription: Ember.computed("orderDescription", function() {
    return !this.get("orderDescription");
  }),

  isInvalidCode: Ember.computed("shipmentorCarryoutCode", function() {
    const codeRegEx = new RegExp(regex.SHIPMENT_ORDER_REGEX);
    return (
      !this.get("shipmentorCarryoutCode") ||
      !codeRegEx.test(this.get("shipmentorCarryoutCode"))
    );
  }),

  isInValidCountry: Ember.computed("country", function() {
    return !this.get("country");
  }),

  isInvalidShipmentDate: Ember.computed("shipmentDate", function() {
    return !this.get("shipmentDate");
  }),

  getCurrentUser: Ember.computed(function() {
    var store = this.get("store");
    var currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  shipmentTypes: Ember.computed(function() {
    let translation = this.get("i18n");
    let shipment = translation.t("order_transports.shipment");
    let carryout = translation.t("order_transports.carry_out");

    return [
      { name: shipment, id: "Shipment" },
      { name: carryout, id: "CarryOut" }
    ];
  }),

  formatOrderCode(type, code) {
    return type == "CarryOut" ? `C${code}` : `S${code}`;
  },

  orderParams() {
    let validCode = this.formatOrderCode(
      this.get("selectedType.id"),
      this.get("shipmentorCarryoutCode")
    );

    let params = {
      state_event: "submit",
      detail_type: this.get("selectedType.id") || "Shipment",
      code: validCode,
      country_id: this.get("country.id"),
      shipment_date: this.get("shipmentDate"),
      people_helped: this.get("peopleCount"),
      description: this.get("orderDescription"),
      submitted_by_id: this.get("getCurrentUser.id")
    };
    return { order: params };
  },

  clearFormData() {
    this.set("showError", false);
    this.set("selectedType", "");
    this.set("country", "");
    this.set("shipmentDate", "");
    this.set("peopleCount", "");
    this.set("orderDescription", "");
  },

  actions: {
    cancel() {
      this.clearFormData();
      this.transitionToRoute("app_menu_list");
    },

    clearDescription() {
      this.set("orderDescription", "");
    },

    typeSelection(value) {
      return this.runTask(async () => {
        this.set("selectedType", value);
        let data = await this.get("orderService").fetchShipmentorCarryoutCode(
          value.id
        );
        this.set("shipmentorCarryoutCode", data);
      }, ERROR_STRATEGIES.MODAL);
    },

    createInternationalOrder() {
      if (
        this.get("isInvalidShipmentDate") ||
        this.get("isInvalidCode") ||
        this.get("isInvalidCountry") ||
        this.get("isInvalidDescription")
      ) {
        this.set("showError", true);
        return;
      }

      return this.runTask(async () => {
        let data = await this.get("orderService").createShipmentorCarryoutOrder(
          this.orderParams()
        );
        this.store.pushPayload(data);
        this.clearFormData();
        this.transitionToRoute("orders");
      }, ERROR_STRATEGIES.MODAL);
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    },

    setCountryValue(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
    }
  }
});
