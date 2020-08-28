import Ember from "ember";

import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  organisationService: Ember.inject.service(),

  setupController(controller, model) {
    this._super(controller, model);
    this.initializeAttributes();
  },

  async initializeOrganisationTypes() {
    const data = await this.store.findAll("organisationType");
    this.store.pushPayload(data);
    this.controller.set("organisationTypes", data);
    this.controller.set("defaultOrganisationType", data.get("firstObject"));
  },

  async initializeAttributes() {
    await this.initializeOrganisationTypes();
  }
});
