import Ember from "ember";

export default Ember.Controller.extend({
  gcOrganisationUsers: null,
  backLinkPath: "",
  organisationService: Ember.inject.service(),

  actions: {
    async searchOrganisation() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();
      this.replaceRoute("organisations.detail", organisation.get("id"));
    }
  }
});
