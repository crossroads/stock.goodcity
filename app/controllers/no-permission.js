import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import preloadDataMixin from "stock/mixins/preload_data";

export default Ember.Controller.extend(preloadDataMixin, {
  queryParams: ["destination", "id"],
  application: Ember.inject.controller(),
  accessKey: "",

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    requestAccessByPass() {
      if (this.get("accessKey") && this.get("accessKey").length === 6) {
        new AjaxPromise(
          `/users/${this.get("session.currentUser.id")}/grant_access`,
          "PUT",
          this.get("session.authToken"),
          { access_key: this.get("accessKey") }
        )
          .then(data => {
            this.get("store").pushPayload(data);
            this.preloadData();
            this.transitionToRoute("/");
          })
          .finally(() => {
            this.set("accessKey", "");
          });
      }
    }
  }
});
