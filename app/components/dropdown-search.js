import Ember from "ember";
import {
  singularize,
  pluralize
} from "ember-inflector";
import AjaxPromise from "stock/utils/ajax-promise";
import _ from "lodash";
const {
  getOwner
} = Ember;

export default Ember.Component.extend({
  selected: [],
  previousValue: "",
  store: Ember.inject.service(),

  resourceType: Ember.computed.alias("packageDetails"),
  selectedData: Ember.computed.alias("selectedValue"),

  selectedDataDisplay: Ember.computed("selectedValuesDisplay", function () {
    return this.get("selectedValuesDisplay");
  }),

  displayLabel: Ember.computed("addAble", function () {
    return this.get("addAble") ? "Add New Item" : "";
  }),

  displayPage: Ember.computed("displayPage", function () {
    return this.get("displayPage");
  }),

  valueChanged(newValue, previousValue) {
    return newValue !== previousValue;
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

    setSelected(fieldName, value) {
      this.get("onConfirm")(fieldName, value.tag);
      if (this.get("displayPage")) {
        let detailType = this.get("detailType").toLowerCase();
        let apiEndpoint = pluralize(detailType);
        let detailId = this.get("detailId");
        var url = `/${apiEndpoint}/${detailId}`;
        let snakeCaseKey = _.snakeCase(fieldName);
        var _this = this;
        var packageDetailParams = {
          [snakeCaseKey]: value.tag || ""
        };
        console.log(packageDetailParams);
        console.log(this.get("previousValue"), "hit");
        if (
          this.valueChanged(
            packageDetailParams[snakeCaseKey],
            this.get("previousValue")
          )
        ) {
          var loadingView = getOwner(this)
            .lookup("component:loading")
            .append();
          new AjaxPromise(url, "PUT", this.get("session.authToken"), {
              [detailType]: packageDetailParams
            })
            .then(data => {
              console.log(data, "data");
              debugger;
              this.get("store").pushPayload(data);
              let selectedValuesObj = {
                ...this.get("selectedValuesDisplay")
              };
              let subformType = Object.keys(data)[0];
              selectedValuesObj[snakeCaseKey] = {
                id: data.id,
                tag: data[subformType][snakeCaseKey]
              };
              console.log(selectedValuesObj);
              _this.set("selectedValuesDisplay", selectedValuesObj);
            })
            .finally(() => {
              loadingView.destroy();
            });
        }
      }
    },

    openDropDown(fieldName) {
      if (this.get("displayPage")) {
        console.log(fieldName);
        this.set(
          "previousValue",
          this.get("selectedDataDisplay")[fieldName]["tag"] || ""
        );
      }
    },

    closeDropDown() {}
  }
});
