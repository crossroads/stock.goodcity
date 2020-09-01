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
    const countryObj = country.get("firstObject");
    this.store.pushPayload(country);
    this.controller.set("country", {
      id: countryObj.get("id"),
      nameEn: countryObj.get("nameEn")
    });
    this.controller.set("countryValue", {
      country_id: countryObj.get("id")
    });
  },

  async initializeAttributes() {
    await this.initializeOrganisationTypes();
    await this.initializeCountry();
  }
});
