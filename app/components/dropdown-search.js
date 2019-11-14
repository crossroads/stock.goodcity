import Ember from "ember";
import { singularize, pluralize } from "ember-inflector";
import _ from "lodash";
const { getOwner } = Ember;
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  selected: [],
  previousValue: "",
  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  subformDetailService: Ember.inject.service(),
  resourceType: Ember.computed.alias("packageDetails"),
  fixedDropdownArr: ["frequency", "voltage", "compTestStatus", "testStatus"],
  fixedDropdownArrId: [
    "frequency_id",
    "voltage_id",
    "compTestStatus_id",
    "testStatus_id"
  ],
  addItem: t("items.new.subform.add_item"),

  displayLabel: Ember.computed("addAble", function() {
    return this.get("addAble") ? this.get("addItem") : "";
  }),

  selectedOptionDisplay: Ember.computed("dropDownValues", function() {
    let selectedValues = {
      ...this.get("dropDownValues")
    };
    let dataObj = {};
    Object.keys(selectedValues).map((data, index) => {
      if (data != "country_id") {
        if (this.get("fixedDropdownArrId").indexOf(data) >= 0) {
          let field = `${data.substring(0, data.length - 3)}`;
          let recordData = this.get("store")
            .peekRecord("lookup", selectedValues[data])
            .get("labelEn");
          dataObj[field] = {
            id: selectedValues[data],
            tag: recordData
          };
        } else {
          dataObj[data] = {
            id: index + 1,
            tag: selectedValues[data]
          };
        }
      }
    });
    return dataObj;
  }),

  isfixedDropdown(fieldName) {
    return this.get("fixedDropdownArr").indexOf(fieldName) >= 0;
  },

  returnConfig(value, fieldName) {
    const isfixedDropdown = this.isfixedDropdown(fieldName);
    return {
      value: isfixedDropdown ? value.id : value.tag,
      name: isfixedDropdown ? `${fieldName}_id` : fieldName,
      previousValue: this.get("previousValue")
    };
  },

  returnSnakeCaseKey(fieldName) {
    const isfixedDropdown = this.isfixedDropdown(fieldName);
    return isfixedDropdown
      ? _.snakeCase(`${fieldName}_id`)
      : _.snakeCase(fieldName);
  },

  returnLabelEn(responseKey) {
    return this.get("store")
      .peekRecord("lookup", responseKey)
      .get("labelEn");
  },

  returnTag(responseKey, fieldName) {
    const isfixedDropdown = this.isfixedDropdown(fieldName);
    return isfixedDropdown ? this.returnLabelEn(responseKey) : responseKey;
  },

  actions: {
    addNewField(name, text) {
      let packageDetails = this.get("packageDetails");
      const newTag = {
        id: packageDetails[name].length + 1,
        tag: text
      };
      let dropDownValues = {
        ...this.get("dropDownValues")
      };
      dropDownValues[name] = text;
      this.set("dropDownValues", dropDownValues);
      this.set("selected", newTag);
      packageDetails[name].push(newTag);
      this.set("packageDetails", packageDetails);
      this.send("setSelected", name, newTag);
    },

    async setSelected(fieldName, value) {
      if (this.get("displayPage")) {
        const isfixedDropdown = this.isfixedDropdown(fieldName);
        const config = this.returnConfig(value, fieldName);
        const snakeCaseKey = this.returnSnakeCaseKey(fieldName);
        const updateResponse = await this.get("onSetValue")(config);
        let selectedValuesObj = {
          ...this.get("selectedValuesDisplay")
        };
        const subformType = Object.keys(updateResponse)[0];
        let responseKey = updateResponse[subformType][snakeCaseKey];
        selectedValuesObj[fieldName] = {
          id: isfixedDropdown ? responseKey : updateResponse.id,
          tag: this.returnTag(responseKey, fieldName)
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
          this.get("selectedValuesDisplay")[fieldName][params] || ""
        );
      }
    }
  }
});
