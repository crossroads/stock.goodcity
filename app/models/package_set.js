import _ from "lodash";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import Ember from "ember";
import { belongsTo, hasMany } from "ember-data/relationships";

/**
 * @module Models/PackageSet
 * @description A collection (or 'set') of packages, locally known as 'items'
 * @augments ember/Model
 *
 */
export default Model.extend({
  description: attr("string"),
  packageIds: attr(),
  packageTypeId: attr("number"),

  packageType: belongsTo("packageType", {
    async: false
  }),

  items: Ember.computed("packageIds.[]", function() {
    return this.getWithDefault("packageIds", []).map(id => {
      return this.get("store").peekRecord("item", id);
    });
  }),

  code: Ember.computed("packageTypeId", function() {
    // Stock seems to use the term 'code' instead of package_type, this is a
    // temporary measure until we remove that name
    // @todo: unify code under the package_type name
    return this.get("store").peekRecord("code", this.get("packageTypeId"));
  }),

  activeOrdersPackages: Ember.computed(
    "items.@each.ordersPackages",
    function() {
      return this.get("items").reduce((ops, record) => {
        ops.push(
          ...record
            .get("ordersPackages")
            .filterBy("quantity")
            .rejectBy("state", "cancelled")
        );
      }, []);
    }
  ),

  hasActiveOrders: Ember.computed("activeOrdersPackages.length", function() {
    return this.get("activeOrdersPackages.length") > 0;
  })
});
