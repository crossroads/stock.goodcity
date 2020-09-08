import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),

  isInvalidPreferredNumber: Ember.computed(
    "preferredContactNumber",
    function() {
      return this.get("preferredContactNumber").length < 8;
    }
  ),

  isInvalidOrganisation: Ember.computed("organisation", function() {
    return !this.get("organisation.nameEn");
  }),

  actions: {
    async goToSearchOrg() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();
      this.set("organisation", organisation);

      const data = await this.get(
        "organisationsUserService"
      ).getOrganisationUser(organisation.get("id"), this.get("user_id"));
      if (data.organisations_user) {
        this.transitionToRoute(
          `/users/${this.get("user_id")}/charity_position?id=${
            data.organisations_user.id
          }`
        );
      } else {
        this.transitionToRoute(
          `/users/${this.get("user_id")}/charity_position`
        );
      }
    },

    onStatusChange(status) {
      this.set("selectedStatus", status);
    },

    save() {
      const params = {
        organisation_id: this.get("organisation.id"),
        user_id: this.get("user_id"),
        position: this.get("position"),
        status: this.get("selectedStatus.name"),
        preferred_contact_number: this.get("preferredContactNumber")
      };

      if (this.get("model")) {
        this.runTask(async () => {
          try {
            await this.get("organisationsUserService").update(
              params,
              this.get("model.id")
            );
            this.replaceRoute("users.details", this.get("user_id"));
          } catch (e) {
            throw e;
          }
        }, ERROR_STRATEGIES.MODAL);
      } else {
        this.runTask(async () => {
          try {
            await this.get("organisationsUserService").create(params);
            this.replaceRoute("users.details", this.get("user_id"));
          } catch (e) {
            throw e;
          }
        }, ERROR_STRATEGIES.MODAL);
      }
    }
  }
});
