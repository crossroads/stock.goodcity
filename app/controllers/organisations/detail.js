import Ember from "ember";

import SearchOptionMixin from "stock/mixins/search_option";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import { regex } from "stock/constants/regex";

export default Ember.Controller.extend(SearchOptionMixin, AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisation: Ember.computed.alias("model"),
  showError: false,

  isInValidNameEn: Ember.computed("model.nameEn", function() {
    return !this.get("model.nameEn").trim().length;
  }),

  isInValidCountry: Ember.computed("country", function() {
    return !this.get("country.id");
  }),

  isInValidWebsite: Ember.computed("model.website", function() {
    const websiteRegEx = new RegExp(regex.WEBSITE_REGEX);

    return (
      this.get("model.website") &&
      !this.get("model.website").match(websiteRegEx)
    );
  }),

  actions: {
    /**
     * Updates the organisation if
     *      nameEn is present
     *      country is present
     *      type is present
     *      website has a valid format iff its present
     */
    updateOrganisation() {
      if (
        !this.get("isInValidNameEn") &&
        !this.get("isInValidCountry") &&
        !this.get("isInValidWebsite")
      ) {
        this.send("update");
      } else {
        this.set("showError", true);
      }
    },

    updateCountry(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
      this.send("updateOrganisation");
    },

    updateOrganisationType({ id, name }) {
      this.set("selectedOrganisationType", { id, name });
      this.send("updateOrganisation");
    },

    update() {
      this.runTask(async () => {
        try {
          const organisation = {
            name_en: this.get("model.nameEn"),
            name_zh_tw: this.get("model.nameZhTw"),
            description_en: this.get("model.descriptionEn"),
            description_zh_tw: this.get("model.descriptionZhTw"),
            registration: this.get("model.registration"),
            website: this.get("model.website"),
            country_id: this.get("country.id"),
            organisation_type_id: this.get("selectedOrganisationType.id")
          };
          await this.get("organisationService").update(
            organisation,
            this.get("model.id")
          );
        } catch (e) {
          this.get("model").rollbackAttributes();
          throw e;
        }
      }, ERROR_STRATEGIES.MODAL);
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    }
  }
});
