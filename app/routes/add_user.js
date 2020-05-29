import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  queryParams: {
    organisationId: null
  },

  model() {
    return Ember.RSVP.hash({
      roles: this.store.findAll("role")
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    let existingRoleIds = [...this.controller.get("selectedRoleIds")].map(
      num => +num
    );
    this.controller.set("existingRoleIds", existingRoleIds);
  }
});
