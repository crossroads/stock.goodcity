import Ember from "ember";
import SearchOptionMixin from "stock/mixins/search_option";

export default Ember.Controller.extend(SearchOptionMixin, {
  selected: {},
  name_en: "",
  name_zh: "",
  validate: false,
  name_en_error: Ember.computed("name_en", "validate", function() {
    return this.get("validate") && !this.get("name_en").trim().length;
  }),
  name_zh_error: Ember.computed("name_zh", "validate", function() {
    return this.get("validate") && !this.get("name_zh").trim().length;
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
        console.log("save the organisation");
      }
    },

    validateFields() {
      this.set("validate", true);
    },

    onConditionChange() {
      console.log("action");
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    },

    changeOrganisationType({ id, name }) {
      this.set("selectedOrganisationType", { id, name });
    },

    setCountryValue(value) {
      let CountryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("selected", {
        id: value.id,
        nameEn: CountryName
      });
      this.set("countryValue", {
        country_id: value.id
      });
    }
  }
});
