import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model() {
    return Ember.RSVP.hash({
      roles: this.store.findAll("role")
    });
  }
});
