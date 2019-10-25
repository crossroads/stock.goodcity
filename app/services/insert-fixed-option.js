import Ember from "ember";
import DS from "ember-data";
import AjaxPromise from "./../utils/ajax-promise";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  fixedOptionDropDown(column, package_details) {
    switch (column) {
      case "frequency":
        return ["50", "50/60 (Multi)", "60", "N/A", "Other"];
      case "voltage":
        return [
          "120V ~ (100-200V)",
          "240V ~ (200-300V)",
          "> 300V",
          "Multi",
          "NA",
          "Other"
        ];
      case "testStatus":
        return [
          "Maintenance (DO NOT USE)",
          "Tested (DO NOT USE)",
          "Untested (DO NOT USE)"
        ];
      case "compTestStatus":
        return ["Active", "Failure", "Obsolete", "Reserved", "Spares"];
      default:
        return [...new Set(package_details.getEach(column).filter(Boolean))];
    }
  }
});
