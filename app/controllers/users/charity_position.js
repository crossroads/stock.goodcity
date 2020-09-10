import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisationsUserService: Ember.inject.service(),
  i18n: Ember.inject.service(),

  isInvalidPreferredNumber: Ember.computed(
    "model.preferredContactNumber",
    function() {
      return (
        !this.get("model.preferredContactNumber") ||
        this.get("model.preferredContactNumber").length < 8
      );
    }
  ),

  isInvalidOrganisation: Ember.computed("organisation", function() {
    return !this.get("model.organisation.nameEn");
  }),

  actions: {
    /**
     * Open's the organisation overlay.
     * On change of organisation, a check is made
     * if organisations_users record already exists for the user, then depending on that URL is changed
     * which in-turn loads a model.
     */
    async serchOrganisation() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();
      this.set("organisation", organisation);

      const organisationUser = this.get(
        "organisationsUserService"
      ).getOrganisationUser(organisation.get("id"), this.get("user_id"));

      if (organisationUser) {
        this.transitionToRoute(
          `/users/${this.get(
            "user_id"
          )}/charity_position?id=${organisationUser.get("id")}`
        );
      } else {
        this.transitionToRoute(
          `/users/${this.get(
            "user_id"
          )}/charity_position?organisationId=${organisation.get("id")}`
        );
      }
    },

    onStatusChange(status) {
      this.set("selectedStatus", status);
    },

    /**
     * Performs save or update operation
     */
    save() {
      this.set(
        "model.user",
        this.get("store").peekRecord("user", this.get("user_id"))
      );
      this.set("model.status", this.get("selectedStatus.name"));
      try {
        this.runTask(async () => {
          await this.get("model").save();
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
