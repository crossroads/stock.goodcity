import Ember from "ember";
import _ from "lodash";

import SearchOptionMixin from "stock/mixins/search_option";
import OrganisationMixin from "stock/mixins/organisation";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(
  SearchOptionMixin,
  AsyncMixin,
  OrganisationMixin,
  {
    organisationService: Ember.inject.service(),
    organisation: Ember.computed.alias("model"),

    isInValidNameEn: Ember.computed("model.nameEn", function() {
      return !this.get("model.nameEn").trim().length;
    }),

    isInValidCountry: Ember.computed("country", function() {
      return !this.get("country.id");
    }),

    actions: {
      /**
       * Updates the organisation if
       *      nameEn is present
       *      country is present
       *      type is present
       */
      updateOrganisation(e) {
        let isValid = true;
        if (e.target.name === "name_en") {
          isValid = !Boolean(this.get("isInValidNameEn"));
        }

        if (isValid) {
          if (
            this.get("model").changedAttributes()[_.camelCase(e.target.name)]
          ) {
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
            let data = await this.get("organisationService").update(
              this.get("model.id"),
              organisation
            );

            this.get("store").pushPayload(data);
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
  }
);
