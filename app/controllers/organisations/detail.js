import Ember from "ember";
import _ from "lodash";

import SearchOptionMixin from "stock/mixins/search_option";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import { regex } from "stock/constants/regex";

export default Ember.Controller.extend(SearchOptionMixin, AsyncMixin, {
  organisationService: Ember.inject.service(),
  organisation: Ember.computed.alias("model"),

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
    updateOrganisation(e) {
      let isValid = true;
      switch (e.target.name) {
        case "name_en":
          isValid = this.get("isInValidNameEn") ? false : true;
          break;

        case "website":
          isValid = this.get("isInValidWebsite") ? false : true;
          break;
      }

      if (isValid) {
        if (this.get("model").changedAttributes()[_.camelCase(e.target.name)]) {
          this.send("update", e.target.name, e.target.value);
        }
      }
    },

    updateCountry(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
      this.send("update", "country_id", value.id);
    },

    updateOrganisationType({ id, name }) {
      this.set("selectedOrganisationType", { id, name });
      this.send("update", "organisation_type_id", id);
    },

    update(name, value) {
      this.runTask(async () => {
        try {
          const organisation = { [name]: value };
          await this.get("organisationService").update(
            this.get("model.id"),
            organisation
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
