import Ember from "ember";
import AsyncMixin from "./async";

export default Ember.Mixin.create(AsyncMixin, {
  organisationService: Ember.inject.service(),
  /**
   * Open's the organisation overlay.
   * Returns the selected organisation record
   * @returns {Object}
   */
  async organisationLookup() {
    const organisation = await this.get(
      "organisationService"
    ).userPickOrganisation();

    return organisation;
  },

  actions: {
    /**
     * Open's the organisation overlay.
     * Once the organisation is selected, navigates to the organisation detail screen
     */
    async withOrganisationNavigation() {
      const organisation = await this.organisationLookup();

      return this.replaceRoute("organisations.detail", organisation.id);
    }
  }
});
