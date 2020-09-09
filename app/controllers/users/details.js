import Ember from "ember";

export default Ember.Controller.extend({
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),

  actions: {
    async addCharityPosition() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();
      const data = await this.get(
        "organisationsUserService"
      ).getOrganisationUser(organisation.get("id"), this.get("model.id"));

      if (data.organisations_user) {
        this.transitionToRoute(
          `/users/${this.get("model.id")}/charity_position?id=${
            data.organisations_user.id
          }`
        );
      } else {
        this.transitionToRoute(
          `/users/${this.get("model.id")}/charity_position?`
        );
      }
    }
  }
});
