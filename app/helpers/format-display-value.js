import Ember from "ember";
import { SALEABLE_OPTIONS } from "stock/constants/saleable-options";
import _ from "lodash";

export default Ember.Helper.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  getRecordName(modelName, modelId) {
    if (!modelId) {
      return "-";
    }
    return this.get("store")
      .peekRecord(modelName, modelId)
      .getWithDefault("name", "N/A");
  },

  getSaleable(value) {
    const saleable = _.find(SALEABLE_OPTIONS, [
      "value",
      value ? value.toString() : value
    ]);
    return this.get("i18n").t(saleable.translation_key).string;
  },

  compute(data) {
    const [type, value] = data;
    switch (type) {
      case "expiry_date":
        if (!value) {
          return "-";
        }
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
      case "saleable":
        return this.getSaleable(value);
      default:
        if (!value) {
          return "-";
        }
        return value;
    }
  }
});
