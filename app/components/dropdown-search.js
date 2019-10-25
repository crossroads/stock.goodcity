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
      this.get("onConfirm")(fieldName, value.tag);
      if (this.get("displayPage")) {
        let detailType = this.get("detailType").toLowerCase();
        let apiEndpoint = pluralize(detailType);
        let detailId = this.get("detailId");
        var url = `/${apiEndpoint}/${detailId}`;
        let snakeCaseKey = _.snakeCase(fieldName);
        var packageDetailParams = {
          [snakeCaseKey]: value.tag || ""
        };
        let updateResponse = await this.get(
          "subformDetailService"
        ).updateRequest(
          detailType,
          apiEndpoint,
          url,
          snakeCaseKey,
          packageDetailParams,
          this.get("previousValue")
        );
        let selectedValuesObj = {
          ...this.get("selectedValuesDisplay")
        };
        let subformType = Object.keys(updateResponse)[0];
        selectedValuesObj[snakeCaseKey] = {
          id: updateResponse.id,
          tag: updateResponse[subformType][snakeCaseKey]
        };
        this.set("selectedValuesDisplay", selectedValuesObj);
      }
    },

    openDropDown(fieldName) {
      if (this.get("displayPage")) {
        this.set(
          "previousValue",
          this.get("selectedDataDisplay")[fieldName]["tag"] || ""
        );
      }
    },

    closeDropDown() {}
  }
});
