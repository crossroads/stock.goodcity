import Ember from "ember";
import { singularize, pluralize } from "ember-inflector";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Component.extend({
  selected: [],
  previousValue: "",
  store: Ember.inject.service(),
  subformDetailService: Ember.inject.service(),
  resourceType: Ember.computed.alias("packageDetails"),
  selectedData: Ember.computed.alias("selectedValue"),
  selectedDataDisplay: Ember.computed.alias("selectedValuesDisplay"),
  displayLabel: Ember.computed("addAble", function() {
    return this.get("addAble") ? "Add New Item" : "";
  }),

  actions: {
    addNew(fieldName, text) {
      let packageDetails = this.get("packageDetails");
      const newTag = {
        id: packageDetails[fieldName].length + 1,
        tag: text
      };
      this.set("selected", newTag);
      packageDetails[fieldName].push(newTag);
      this.set("packageDetails", packageDetails);
      this.send("setSelected", fieldName, newTag);
    },

    async setSelected(fieldName, value) {
      if (this.get("displayPage")) {
        const config = {
          value: value.tag,
          name: fieldName,
          previousValue: this.get("previousValue")
        };
        const snakeCaseKey = _.snakeCase(fieldName);
        const updateResponse = await this.get("onSetValue")(config);
        let selectedValuesObj = {
          ...this.get("selectedValuesDisplay")
        };
        const subformType = Object.keys(updateResponse)[0];
        selectedValuesObj[snakeCaseKey] = {
          id: updateResponse.id,
          tag: updateResponse[subformType][snakeCaseKey]
        };
        this.set("selectedValuesDisplay", selectedValuesObj);
      } else {
        this.get("onConfirm")(fieldName, value.tag);
      }
    },

    openDropDown(fieldName) {
      if (this.get("displayPage")) {
        this.set(
          "previousValue",
          this.get("selectedDataDisplay")[fieldName]["tag"] || ""
        );
      }
    }
  }
});
