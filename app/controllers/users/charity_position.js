import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),
  i18n: Ember.inject.service(),

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
    /**
     * Open's the organisation overlay.
     * On change of organisation, a check is made
     * if organisations_users record already exist, and depending on that URL is changed
     * which in-turn loads a model.
     */
    async serchOrganisation() {
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

    /**
     * Performs save or update operation based on the condition:
     *    - If a model exist, then its an update operation
     *    - If a model doesn't exist, then its an create operation
     */
    save() {
      const params = {
        organisation_id: this.get("organisation.id"),
        user_id: this.get("user_id"),
        position: this.get("position"),
        status: this.get("selectedStatus.name"),
        preferred_contact_number: this.get("preferredContactNumber")
      };

      try {
        this.runTask(async () => {
          if (this.get("model")) {
            await this.get("organisationsUserService").update(
              params,
              this.get("model.id")
            );
          } else {
            await this.get("organisationsUserService").create(params);
          }
          this.replaceRoute("users.details", this.get("user_id"));
        }, ERROR_STRATEGIES.MODAL);
      } catch (error) {
        throw error;
      }
    },

    async cancel() {
      const confirmed = await this.modalConfirm(
        this.get("i18n").t("users.charity_position.cancel_warning")
      );

      if (!confirmed) {
        return;
      }

      this.replaceRoute("users.details", this.get("user_id"));
    }
  }
});
