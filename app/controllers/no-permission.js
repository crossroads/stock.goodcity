import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["destination", "id"],
  application: Ember.inject.controller(),

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    tryAttemptedTransition() {
      if (this.destination) {
        if (this.id) {
          this.transitionToRoute(this.destination, +this.id);
        } else {
          this.transitionToRoute(this.destination);
        }
      } else {
        this.transitionToRoute("/");
      }
    }
  }
});
