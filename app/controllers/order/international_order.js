import Ember from "ember";
import SearchOptionMixin from "stock/mixins/search_option";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ShipmentMixin from "stock/mixins/grades_option";
import { STATE_EVENTS } from "stock/constants/state-events";
import { INTERNATIONAL_ORDERS } from "stock/constants/state-events";
import { regex } from "stock/constants/regex";

export default Ember.Controller.extend(
  SearchOptionMixin,
  AsyncMixin,
  ShipmentMixin,
  {
    i18n: Ember.inject.service(),
    showError: false,
    orderService: Ember.inject.service(),
    session: Ember.inject.service(),

    isInvalidDescription: Ember.computed.not("orderDescription"),
    isInvalidPeopleCount: Ember.computed.not("peopleCount"),

    isInvalidCode: Ember.computed("shipmentOrCarryoutCode", function() {
      const codeRegEx = new RegExp(regex.SHIPMENT_ORDER_REGEX);
      return (
        !this.get("shipmentOrCarryoutCode") ||
        !codeRegEx.test(this.get("shipmentOrCarryoutCode"))
      );
    }),

    isInvalidCountry: Ember.computed.not("country"),

    isInvalidShipmentDate: Ember.computed.not("shipmentDate"),

    orderParams() {
      let params = {
        state_event: STATE_EVENTS.SUBMIT,
        detail_type:
          this.get("selectedType.id") || INTERNATIONAL_ORDERS.SHIPMENT,
        code: `${this.get("prefix")}${this.get("shipmentOrCarryoutCode")}`,
        country_id: this.get("country.id"),
        shipment_date: this.get("shipmentDate"),
        people_helped: this.get("peopleCount"),
        description: this.get("orderDescription"),
        submitted_by_id: this.get("session.currentUser.id")
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

      async handleTypeChange(value) {
        return await this.runTask(async () => {
          this.set("selectedType", value);
          let { code } = await this.get("orderService").getNextCode(value.id);
          this.set("shipmentOrCarryoutCode", code.substr(1));
          this.set("prefix", code[0]);
        }, ERROR_STRATEGIES.MODAL);
      },

      async createInternationalOrder() {
        if (
          this.get("isInvalidShipmentDate") ||
          this.get("isInvalidCode") ||
          this.get("isInvalidCountry") ||
          this.get("isInvalidDescription") ||
          this.get("isInvalidPeopleCount")
        ) {
          this.set("showError", true);
          return;
        }

        return await this.runTask(async () => {
          const { designation } = await this.get(
            "orderService"
          ).createShipmentOrCarryoutOrder(this.orderParams());
          this.clearFormData();

          this.transitionToRoute("orders.active_items", designation.id);
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
  }
);
