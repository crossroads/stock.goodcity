import Ember from "ember";
import _ from "lodash";
import apptUtils from "../utils/unique-array";

export default Ember.Mixin.create({
  subFormDetails: Ember.computed("packageDetails", function() {
    if (this.get("showAdditionalFields")) {
      let package_details = this.get("packageDetails");
      if (package_details) {
        let subFormData = {};
        let columns = Object.keys(package_details.get("firstObject").toJSON());
        columns.map(column => {
          let columnData = [];
          columnData = this.get("setDropdownOption").setOptions(
            column,
            package_details
          );
          let uniqueArray = _.sortBy(
            apptUtils.removeDuplicates(columnData, "tag"),
            "tag"
          );
          subFormData[column] = uniqueArray.map((_column, index) => {
            return {
              id: _column.id,
              tag: _column.tag
            };
          });
        });
        return subFormData;
      }
    }
  }),

  returnDisplayFields: function(subform) {
    if (this.get("showAdditionalFields")) {
      return this.get("fields").additionalFields.filter(function(field) {
        return field.category.includes(subform);
      });
    }
  }
});
