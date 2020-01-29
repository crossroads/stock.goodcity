import { inject as service } from "@ember/service";
import Route from "@ember/routing/route";
import { getOwner } from "@ember/application";

export default Route.extend({
  cordova: service(),

  loadOrRedirectUser() {
    if (!this.get("session.currentUser")) {
      getOwner(this)
        .lookup("route:application")
        ._loadDataStore();
    } else {
      if (this.session.get("isLoggedIn")) {
        this.get("cordova").appLoad();
      }
      this.transitionTo("/");
    }
  },

  beforeModel() {
    if (
      window.localStorage.getItem("authToken") &&
      this.session.get("isLoggedIn")
    ) {
      this.loadOrRedirectUser();
    } else {
      this.transitionTo("login");
    }
  }
});
