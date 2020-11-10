import Ember from "ember";
import detail from "./detail";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import SearchOptionMixin from "stock/mixins/search_option";
import { INTERNATIONAL_ORDERS } from "stock/constants/state-events";
import { regex } from "stock/constants/regex";

export default detail.extend(SearchOptionMixin, AsyncMixin, {
  orderService: Ember.inject.service(),
  setOrgUserApproval(status) {
    this.runTask(() => {
      this.get("organisationsUser").set("status", status);
      return this.get("organisationsUser").save();
    });
  },

  isValidCode: Ember.computed("codeWithoutPrefix", function() {
    const codeRegEx = new RegExp(regex.SHIPMENT_ORDER_REGEX);
    return (
      this.get("codeWithoutPrefix") &&
      codeRegEx.test(this.get("codeWithoutPrefix"))
    );
  }),

  selectedCountry: Ember.computed("order", function() {
    return {
      id: this.get("order.countryId"),
      nameEn: this.get("order.countryName")
    };
  }),

  formatOrderCode(type, code) {
    return type == INTERNATIONAL_ORDERS.CARRYOUT ? `C${code}` : `S${code}`;
  },

  actions: {
    updateInternationalOrderDetails(e) {
      let value = e.target.value.trim();
      let changedAttributes = this.get("order").changedAttributes();
      delete changedAttributes["shipmentDate"];
      if (Object.keys(changedAttributes).length === 0) {
        this.set(`${e.target.id}ValidationError`, false);
        return;
      }
      let isValid;
      switch (e.target.id) {
        case "people_helped":
          isValid = Boolean(value);
          break;
        case "description":
          isValid = Boolean(value);
          break;
        case "code":
          isValid = Boolean(this.get("isValidCode"));
          break;
      }

      if (isValid) {
        value =
          e.target.id == "code"
            ? this.formatOrderCode(this.get("order.detailType"), value)
            : value;
        this.send("updateOrderDetails", e.target.id, value);
      } else {
        this.get("order").rollbackAttributes();
        Ember.$(`#${e.target.id}`).focus();
        this.set(`${e.target.id}ValidationError`, true);
      }
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    },

    updateOrderCode(e) {
      let value = this.formatOrderCode(
        this.get("order.detailType"),
        e.target.value.trim()
      );
      this.set("order.code", value);
      this.send("updateInternationalOrderDetails", e);
    },

    updatePeopleHelped(e) {
      let value = parseInt(e.target.value.trim());
      this.set("order.peopleHelped", value);
      this.send("updateInternationalOrderDetails", e);
    },

    updateShipmentDate(date) {
      this.send("updateOrderDetails", "shipment_date", date);
    },

    updateCountry(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("selectedCountry", { id: value.id, nameEn: countryName });
      this.send("updateOrderDetails", "country_id", value.id);
    },

    async updateOrderDetails(field, value) {
      this.set(`${field}ValidationError`, false);

      this.runTask(async () => {
        try {
          let params = { [field]: value };
          await this.get("orderService").updateShipmentOrCarryoutOrder(
            this.get("order"),
            { order: params }
          );
        } catch (e) {
          this.get("order").rollbackAttributes();
          this.set("codeWithoutPrefix", this.get("order.code").slice(1));
          throw e;
        }
      }, ERROR_STRATEGIES.MODAL);
    },

    approveOrganisationsUser() {
      this.setOrgUserApproval("approved");
    },
    denyOrganisationsUser() {
      this.setOrgUserApproval("denied");
    }
  }
});
