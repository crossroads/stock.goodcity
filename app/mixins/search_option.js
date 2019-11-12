import Ember from "ember";
import _ from "lodash";

export default Ember.Mixin.create({
  searchText: "",
  resultArray: [],
  onSearchCountry(field, searchText) {
    this.set("searchText", Ember.$.trim(searchText));
    Ember.run.debounce(this, this.applyFilter, field, 500);
  },

  applyFilter: function(field) {
    let searchTextLength = this.get("searchText").length;
    let searchText = searchTextLength ? this.get("searchText") : "";
    this.get("store")
      .query(field, {
        searchText
      })
      .then(data => {
        //Check the input has changed since the promise started
        if (searchText === this.get("searchText")) {
          this.set("resultArray", Ember.A(data));
        }
      });
  }
});
