import Ember from "ember";

import SearchOptionMixin from "stock/mixins/search_option";
import GoodcityController from "../goodcity_controller";

export default GoodcityController.extend(SearchOptionMixin, {
  organisationService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  name_en: "",
  name_zh_tw: "",
  website: "",
  validate: false,

  name_en_error: Ember.computed("name_en", "validate", function() {
    return this.get("validate") && !this.get("name_en").trim().length;
  }),

  country_error: Ember.computed("countryValue", "validate", function() {
    return this.get("validate") && !this.get("countryValue");
  }),

  website_error: Ember.computed("website", "validate", function() {
    const websiteRegEx = new RegExp(
      `^(www\.|https?:\/\/(www\.)?)[a-zA-Z0-9-]+\.[a-zA-Z]+\.?[a-zA-Z0-9-#.]*[a-z]$`
    );

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
    createOrganisation(p) {
      this.send("validateFields");
      if (
        !this.get("name_en_error") &&
        !this.get("country_error") &&
        !this.get("website_error")
      ) {
        this.showLoadingSpinner();
        const organisation = {
          name_en: this.get("name_en"),
          name_zh_tw: this.get("name_zh_tw"),
          description_en: this.get("description_en"),
          description_zh_tw: this.get("description_zh_tw"),
          registration: this.get("registration"),
          website: this.get("website"),
          country_id: this.get("countryValue").country_id,
          organisation_type_id: this.get("selectedOrganisationType").id
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

    cancel() {
      const cancel = () => {
        Ember.run.later(this, function() {
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
          this.replaceRoute("/");
        });
      };

      this.get("messageBox").custom(
        this.get("i18n").t("organisation.cancel_warning"),
        "Yes",
        cancel,
        "No"
      );
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
