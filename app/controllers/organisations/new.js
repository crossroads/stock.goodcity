import Ember from "ember";

import GoodcityController from "../goodcity_controller";
import SearchOptionMixin from "stock/mixins/search_option";

export default GoodcityController.extend(SearchOptionMixin, {
  name_en: "",
  name_zh_tw: "",
  validate: false,
  organisationService: Ember.inject.service(),

  name_en_error: Ember.computed("name_en", "validate", function() {
    return this.get("validate") && !this.get("name_en").trim().length;
  }),
  name_zh_tw_error: Ember.computed("name_zh_tw", "validate", function() {
    return this.get("validate") && !this.get("name_zh_tw").trim().length;
  }),
  country_error: Ember.computed("countryValue", "validate", function() {
    return this.get("validate") && !this.get("countryValue");
  }),

  actions: {
    createOrganisation(p) {
      this.send("validateFields");
      if (
        !this.get("name_en_error") &&
        !this.get("name_zh_error") &&
        !this.get("country_error")
      ) {
        this.showLoadingSpinner();
        const organisation = {
          name_en: this.get("name_en"),
          name_zh_tw: this.get("name_zh_tw"),
          description_en: this.get("description_en"),
          description_zh_tw: this.get("description_zh_tw"),
          registration: this.get("registration"),
          website: this.get("website"),
          country_id: this.get("countryValue").country_id
        };

        this.get("organisationService")
          .create(organisation)
          .then(data => {
            this.replaceRoute("organisations.detail", data.organisation.id);
            this.hideLoadingSpinner();
          });
      }
    },

    validateFields() {
      this.set("validate", true);
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
      this.set("countryValue", {
        country_id: value.id
      });
    }
  }
});
