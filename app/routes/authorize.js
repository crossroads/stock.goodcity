import Ember from "ember";

export default Ember.Route.extend({
  beforeModel(transition) {
    if (!this.session.get("isLoggedIn")) {
      transition.abort();
      var loginController = this.controllerFor("login");
      loginController.set("attemptedTransition", transition);
      this.transitionTo("login");
      return false;
    }
    return true;
  },

  loadIfAbsent(model, id) {
    // note: using findRecord with reload:false will make a request regardless of whether the data is
    // present or not. If it is present, it will return immediatly but still proceed to making the request
    // which can result in weird race conditions later on. We use peek explicitely here to avoid this.
    return (
      this.store.peekRecord(model, id) ||
      this.store.findRecord(model, id, {
        reload: true
      })
    );
  }
});
