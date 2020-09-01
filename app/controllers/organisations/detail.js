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

  actions: {
    updateOrganisation() {
      const changedAttrs = this.get("model").changedAttributes();
      Object.keys(changedAttrs).map(attr => {
        switch (attr) {
          case "nameEn":
            this.set("validate", true);
        }
      });

      if (!this.get("name_en_error") && !this.get("country_error")) {
        this.send("update", this.get("model"));
      }
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
            website: this.get("model.website")
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
