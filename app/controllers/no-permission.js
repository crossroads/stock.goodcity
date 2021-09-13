import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["destination", "id"],
  application: Ember.inject.controller(),
  accessKey: "",

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    hello() {
      if (this.get("accessKey") && this.get("accessKey").length === 6) {
        // submit access key API
      }
    }
  }
});
