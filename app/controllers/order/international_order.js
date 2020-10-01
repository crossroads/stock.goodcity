import Ember from "ember";
import SearchOptionMixin from "stock/mixins/search_option";

export default Ember.Controller.extend(SearchOptionMixin, {
  actions: {
    cancel() {
      // this.clearParams();
      this.transitionToRoute("app_menu_list");
    },

    createInternationalOrder() {},

    onSearch(field, searchText) {
      this.onSearchCountry(field, searchText);
    },

    setCountryValue(value) {
      const countryName = this.get("store")
        .peekRecord("country", value.id)
        .get("nameEn");
      this.set("country", { id: value.id, nameEn: countryName });
    }
  }
});
