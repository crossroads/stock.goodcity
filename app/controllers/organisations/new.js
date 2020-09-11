import Ember from "ember";

import SearchOptionMixin from "stock/mixins/search_option";
import GoodcityController from "../goodcity_controller";
import AsyncMixin from "stock/mixins/async";
import { regex } from "stock/constants/regex";

export default GoodcityController.extend(SearchOptionMixin, AsyncMixin, {
  organisationService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  showError: false,
  name_en: "",
  name_zh_tw: "",
  website: "",
  validate: false,

  isInValidNameEn: Ember.computed("name_en", function() {
    return !this.get("name_en").trim().length;
  }),

  isInValidCountry: Ember.computed("country", function() {
    return !this.get("country");
  }),

  isInValidWebsite: Ember.computed("website", function() {
    const websiteRegEx = new RegExp(regex.WEBSITE_REGEX);

    return this.get("website") && !this.get("website").match(websiteRegEx);
  }),

  actions: {
    /**
     * Create new organisation if
     *      nameEn is present
     *      country is present
     *      type is present
     *      website has a valid format iff its present
     */
    createOrganisation() {
      if (
        !this.get("isInValidNameEn") &&
        !this.get("isInValidCountry") &&
        !this.get("isInValidWebsite")
      ) {
        const organisation = {
          name_en: this.get("name_en"),
          name_zh_tw: this.get("name_zh_tw"),
          description_en: this.get("description_en"),
          description_zh_tw: this.get("description_zh_tw"),
          registration: this.get("registration"),
          website: this.get("website"),
          country_id: this.get("country.id"),
          organisation_type_id: this.get("selectedOrganisationType").id
        };
        this.runTask(async () => {
          const data = await this.get("organisationService");

          this.replaceRoute("organisations.detail", data.organisation.id);
        });
      } else {
        this.set("showError", true);
      }
    },

    clearForm() {
      this.setProperties({
        name_en: "",
        name_zh_tw: "",
        description_en: "",
        description_zh_tw: "",
        registration: "",
        website: "",
        country_id: "",
        organisation_type_id: ""
      });
    },

    async cancel() {
      const resetForm = () => {
        Ember.run.later(this, function() {
          this.send("clearForm");
          this.replaceRoute("/");
        });
      };

      const confirmed = await this.modalConfirm("organisation.cancel_warning");

      if (!confirmed) {
        return;
      }

      return resetForm();
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    },

    changeOrganisationType({ id, name }) {
      this.set("selectedOrganisationType", { id, name });
    },

    setCountryValue(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
    }
  }
});
