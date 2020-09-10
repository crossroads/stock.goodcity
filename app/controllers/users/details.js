import Ember from "ember";

export default Ember.Controller.extend({
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),
  userOrganisationDetails: Ember.computed(
    "model.organisations_users_ids",
    function() {
      const organisationUser = [];

      this.get("model.organisationsUsers").map(record => {
        organisationUser.push({
          status: record.get("userStatus"),
          name: this.store
            .peekRecord("organisation", record.get("organisationId"))
            .get("nameEn")
        });
      });
      return organisationUser;
    }
  ),
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
