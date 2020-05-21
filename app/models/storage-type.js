import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  name: attr("string"),

  isBox: Ember.computed.match("name", /box/i),
  isPackage: Ember.computed.match("name", /package/i),
  isPallet: Ember.computed.match("name", /pallet/i)
});
