import Ember from "ember";

export default Ember.Controller.extend({
  organisationService: Ember.inject.service(),

  actions: {
    async goToSearchOrg() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();

      this.set("organisation", organisation);
    }
  }
});
