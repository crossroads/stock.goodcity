import Ember from "ember";
import Model from "ember-data/model";
import { hasMany, belongsTo } from "ember-data/relationships";
import attr from "ember-data/attr";

export default Model.extend({
  area: attr("string"),
  building: attr("string"),
  createdAt: attr("date"),
  recentlyUsedAt: attr("date"),
  printer: belongsTo("printer"),
  items: hasMany("item", { async: false }),
  package_locations: hasMany("location", { async: false }),

  name: Ember.computed("area", "building", function() {
    var area = this.get("area");
    var building = this.get("building");
    return area ? `${building}-${area}` : building;
  }),

  displayName: Ember.computed("area", "building", function() {
    var area = this.get("area");
    var building = this.get("building");
    return area ? `${building}${area}` : building;
  })
});
