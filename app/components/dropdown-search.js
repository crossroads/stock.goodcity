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
  fixedDropdownArr: ["frequency", "voltage", "compTestStatus", "testStatus"],
  selectedData: Ember.computed.alias("selectedValue"),
  selectedDataDisplay: Ember.computed.alias("selectedValuesDisplay"),
  displayLabel: Ember.computed("addAble", function() {
    return this.get("addAble") ? "Add New Item" : "";
  }),

  isfixedDropdown(fieldName) {
    return this.get("fixedDropdownArr").indexOf(fieldName) >= 0;
  },

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
        let selectedValue = this.isfixedDropdown(fieldName)
          ? value.id
          : value.tag;
        let selectedField = this.isfixedDropdown(fieldName)
          ? `${fieldName}_id`
          : fieldName;

        const config = {
          value: selectedValue,
          name: selectedField,
          previousValue: this.get("previousValue")
        };
        const snakeCaseKey = this.isfixedDropdown(fieldName)
          ? _.snakeCase(`${fieldName}_id`)
          : _.snakeCase(fieldName);
        const updateResponse = await this.get("onSetValue")(config);
        let selectedValuesObj = {
          ...this.get("selectedValuesDisplay")
        };
        const subformType = Object.keys(updateResponse)[0];
        selectedValuesObj[fieldName] = {
          id: this.isfixedDropdown(fieldName)
            ? updateResponse[subformType][snakeCaseKey]
            : updateResponse.id,
          tag: this.isfixedDropdown(fieldName)
            ? this.get("store")
                .peekRecord("lookup", updateResponse[subformType][snakeCaseKey])
                .get("labelEn")
            : updateResponse[subformType][snakeCaseKey]
        };
        this.set("selectedValuesDisplay", selectedValuesObj);
      } else {
        this.get("onConfirm")(fieldName, value);
      }
    },

    openDropDown(fieldName) {
      if (this.get("displayPage")) {
        let params = this.isfixedDropdown(fieldName) ? "id" : "tag";
        this.set(
          "previousValue",
          this.get("selectedDataDisplay")[fieldName][params] || ""
        );
      }
    }
  }
});
