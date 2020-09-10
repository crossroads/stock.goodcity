import Ember from "ember";

export default Ember.Controller.extend({
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),
  userOrganisationDetails: Ember.computed("model", function() {
    const organisationUser = [];

    this.get("model.organisationsUsers").map(record => {
      organisationUser.push({
        id: record.get("id"),
        status: record.get("userStatus"),
        name: this.store
          .peekRecord("organisation", record.get("organisationId"))
          .get("nameEn")
      });
    });
    return organisationUser;
  }),
  actions: {
    async addCharityPosition() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();

      const organisationUser = this.get(
        "organisationsUserService"
      ).getOrganisationUser(organisation.get("id"), this.get("model.id"));

      if (organisationUser) {
        this.transitionToRoute(
          `/users/${this.get(
            "model.id"
          )}/charity_position?id=${organisationUser.get("id")}`
        );
      } else {
        this.transitionToRoute(
          `/users/${this.get(
            "model.id"
          )}/charity_position?organisationId=${organisation.get("id")}`
        );
      }
    },
    viewCharityPosition(id) {
      this.transitionToRoute(
        `/users/${this.get("model.id")}/charity_position?id=${id}`
      );
    }
  }
});
