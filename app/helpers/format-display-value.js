import Ember from "ember";
import { SALEABLE_OPTIONS } from "stock/constants/saleable-options";
import _ from "lodash";

export default Ember.Helper.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  getRecordName(modelName, modelId, fieldName = "name") {
    if (!modelId) {
      return "-";
    }

    let record = this.get("store").peekRecord(modelName, modelId);

    if (record) {
      return record.getWithDefault(fieldName, "N/A");
    } else {
      return "-";
    }
  },

  getSaleable(value) {
    const saleable = _.find(SALEABLE_OPTIONS, [
      "value",
      _.isNull(value) ? value : value.toString()
    ]);
    return this.get("i18n").t(saleable.translation_key).string;
  },

  getLookUp(modelId) {
    if (!modelId) {
      return "-";
    }
    const label = this.get("i18n.locale") === "en" ? "labelEn" : "labelZhTw";
    return this.getRecordName("lookup", modelId, label);
  },

  getCountry(modelId) {
    if (!modelId) {
      return "-";
    }
    const label = this.get("i18n.locale") === "en" ? "nameEn" : "nameZhTw";
    const record = this.get("store").peekRecord("country", modelId);
    if (!record) {
      return "N/A";
    }
    return record.getWithDefault(label, "N/A");
  },

  getSaleable(value) {
    const saleable = _.find(SALEABLE_OPTIONS, [
      "value",
      _.isNull(value) ? value : value.toString()
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
      case "frequency_id":
        return this.getLookUp(value);
      case "voltage_id":
        return this.getLookUp(value);
      case "test_status_id":
        return this.getLookUp(value);
      case "comp_test_status_id":
        return this.getLookUp(value);
      case "country_id":
        return this.getCountry(value);
      default:
        if (!value) {
          return "-";
        }
        return value;
    }
  }
});
