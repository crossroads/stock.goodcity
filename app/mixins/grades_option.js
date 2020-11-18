import _ from "lodash";
import Ember from "ember";
import { SALEABLE_OPTIONS } from "stock/constants/saleable-options";

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),

  grades: Ember.computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  }),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("order.user_title.mr");
    let mrs = translation.t("order.user_title.mrs");
    let miss = translation.t("order.user_title.miss");
    let ms = translation.t("order.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  shipmentTypes: Ember.computed(function() {
    let translation = this.get("i18n");
    let shipment = translation.t("order_transports.shipment");
    let carryout = translation.t("order_transports.carry_out");

    return [
      { name: shipment, id: "Shipment" },
      { name: carryout, id: "CarryOut" }
    ];
  }),

  languages: Ember.computed(function() {
    let translation = this.get("i18n");
    let english = translation.t("users.languages.english");
    let chinese = translation.t("users.languages.chinese");

    return [{ name: english, id: "en" }, { name: chinese, id: "zh-tw" }];
  }),

  saleableOptions: Ember.computed(function() {
    return _.map(SALEABLE_OPTIONS, obj => {
      return { ...obj, name: this.get("i18n").t(obj.translation_key).string };
    });
  }),

  restrictionOptions: Ember.computed(function() {
    return this.store.peekAll("restriction");
  })
});
