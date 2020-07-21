import OrganisationRoute from "./../organisation";

export default OrganisationRoute.extend({
  setupController(controller, model) {
    this._super(controller, model);
    controller.on();
  }
});
