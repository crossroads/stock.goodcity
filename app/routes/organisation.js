import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return (
      this.store.peekRecord("gc_organisation", params.organisation_id) ||
      this.store.findRecord("gc_organisation", params.organisation_id, {
        reload: true
      })
    );
  },

  setupController(controller, model) {
    this._super(controller, model);
    let gcOrganisationUsers = this.store
      .peekAll("organisationsUser")
      .filterBy("organisationId", parseInt(model.id));
    controller.set("gcOrganisationUsers", gcOrganisationUsers);
  }
});
