import { A } from "@ember/array";
import { debounce } from "@ember/runloop";
import $ from "jquery";
import Mixin from "@ember/object/mixin";
import _ from "lodash";

export default Mixin.create({
  searchText: "",
  resultArray: [],
  onSearchCountry(field, searchText) {
    this.set("searchText", $.trim(searchText));
    debounce(this, this.applyFilter, field, 500);
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
          this.set("resultArray", A(data));
        }
      });
  }
});
