import Ember from "ember";
import _ from "lodash";

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  fixedOptionDropDown(column, package_details) {
    if (["frequency", "voltage", "testStatus"].indexOf(column) > -1) {
      return this.fetchLookups(`electrical_${_.snakeCase(column)}`);
    } else if (column === "compTestStatus") {
      return this.fetchLookups("comp_test_status");
    } else {
      return [...new Set(package_details.getEach(column).filter(Boolean))];
    }
  },

  fetchLookups(lookupName) {
    return this.get("store")
      .peekAll("lookup")
      .filterBy("name", lookupName)
      .getEach("labelEn");
  }
});
