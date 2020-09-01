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
    this.controller.set("selectedOrganisationType", data.get("firstObject"));
  },

  async initializeCountry() {
    const country = await this.store.query("country", {
      searchText: "China - Hong Kong"
    });

    this.store.pushPayload(country);
    this.controller.set("country", {
      id: country.get("firstObject.id"),
      nameEn: country.get("firstObject.nameEn")
    });
  },

  async initializeAttributes() {
    await this.initializeOrganisationTypes();
    await this.initializeCountry();
  }
});
