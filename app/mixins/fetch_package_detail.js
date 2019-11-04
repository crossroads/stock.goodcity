import Ember from "ember";
import _ from "lodash";

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
          subFormData[column] = columnData.map((_column, index) => {
            return {
              id: index + 1,
              tag: columnData[index]
            };
          });
        });
        return subFormData;
      }
    }
  })
});
