import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  brand: attr("string"),
  model: attr("string"),
  serialNumber: attr("string"),
  countryId: attr("number"),
  standard: attr("string"),
  voltage: attr("number"),
  frequency: attr("number"),
  power: attr("string"),
  systemOrRegion: attr("string"),
  testStatus: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  item: belongsTo("item"),
  country: Ember.computed("countryId", function() {
    let countryId = this.get("countryId");
    if (countryId) {
      return this.store.peekRecord("country", this.get("countryId"));
    }
  })
});
