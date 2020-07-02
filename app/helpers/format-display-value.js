import Ember from "ember";

export default Ember.Helper.extend({
  store: Ember.inject.service(),

  compute(data) {
    const [type, value] = data;
    switch (type) {
      case "expiry_date":
        return moment(value).format("LLL");
      case "location_id":
        return this.get("store")
          .peekRecord("location", value || 21)
          .getWithDefault("name", "N/A");
      case "restriction_id":
        return this.get("store")
          .peekRecord("restriction", value)
          .getWithDefault("name", "N/A");
      case "package_type_id":
        return this.get("store")
          .peekRecord("code", value)
          .getWithDefault("name", "N/A");
      default:
        return value;
    }
  }
});
