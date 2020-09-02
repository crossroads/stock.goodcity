import Ember from "ember";

import SearchOptionMixin from "stock/mixins/search_option";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(SearchOptionMixin, AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisation: Ember.computed.alias("model"),

  name_en_error: Ember.computed("model.nameEn", "validate", function() {
    return this.get("validate") && !this.get("model.nameEn").trim().length;
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
     * Updates the organisation if
     *      nameEn is present
     *      country is present
     *      type is present
     *      website has a valid format iff its present
     */
    updateOrganisation() {
      const changedAttrs = this.get("model").changedAttributes();
      Object.keys(changedAttrs).map(attr => {
        switch (attr) {
          case "nameEn":
            this.set("validate", true);
        }
      });

      if (
        !this.get("name_en_error") &&
        !this.get("country_error") &&
        !!this.get("website_error")
      ) {
        this.send("update", this.get("model"));
      }
    },

    updateCountry(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
      this.set("countryValue", { country_id: value.id });
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
            country_id: this.get("countryValue").country_id,
            organisation_type_id: this.get("selectedOrganisationType").id
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
