import Ember from "ember";
import SearchOptionMixin from "stock/mixins/search_option";

export default Ember.Controller.extend(SearchOptionMixin, {
  selected: {},

  actions: {
    onConditionChange() {
      console.log("action");
    },

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
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
