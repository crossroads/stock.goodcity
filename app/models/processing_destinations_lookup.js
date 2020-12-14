import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  name: attr("string"),
  lookups: function() {
    const allRecords = this.store.peekAll("processing_destinations_lookup");
    return allRecords.map(record => ({
      id: record.get("id"),
      name: record.get("name")
    }));
  }
});
