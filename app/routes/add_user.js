import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  queryParams: {
    organisationId: null
  },

  model() {
    let districts = this.store.query("district", {});
    return Ember.RSVP.hash({
      districts
    });
  }
});
