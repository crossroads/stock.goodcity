import Ember from "ember";

export default Ember.Helper.extend({
  store: Ember.inject.service(),

  getRecordName(modelName, modelId) {
    return this.get("store")
      .peekRecord(modelName, modelId)
      .getWithDefault("name", "N/A");
  },

  compute(data) {
    const [type, value] = data;
    switch (type) {
      case "expiry_date":
        return moment(value).format("LLL");
      case "location_id":
        return this.getRecordName("location", value);
      case "restriction_id":
        return this.getRecordName("restriction", value);
      case "package_type_id":
        return this.getRecordName("code", value);
      case "storage_type_id":
        return this.getRecordName("storage-type", value);
      case "donor_condition_id":
        return this.getRecordName("donor_condition", value);
      default:
        return value;
    }
  }
});
