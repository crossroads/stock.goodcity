import { computed } from "@ember/object";
import DS from "ember-data";

export default DS.Model.extend({
  item: DS.belongsTo("item", {
    inverse: "detail"
  }),
  country: computed("countryId", function() {
    let countryId = this.get("countryId");
    if (countryId) {
      return this.store.peekRecord("country", this.get("countryId"));
    }
  })
});
