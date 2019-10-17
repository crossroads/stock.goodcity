import Ember from "ember";
import { singularize, pluralize } from "ember-inflector";
import AjaxPromise from "stock/utils/ajax-promise";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Component.extend({
  // classNames: "Example",
  selected: [],
  store: Ember.inject.service(),
  selectedTags: [],
  optionObject: {},
  selectedOptionData: " ",
  disbale: true,
  previousValue: "",

  resourceType: Ember.computed("packageDetails", function() {
    return this.get("packageDetails");
  }),

  selectedData: Ember.computed("selectedValues", function() {
    return this.get("selectedValues");
  }),

  selectedDataDisplay: Ember.computed(
    "selectedValuesDisplay.{brand}",
    function() {
      return this.get("selectedValuesDisplay");
    }
  ),

  displayPage: Ember.computed("displayPage", function() {
    return this.get("displayPage");
  }),

  valueChanged(newValue, previousValue) {
    return newValue !== previousValue;
  },

  actions: {
    addNew(fieldName, text) {
      this.set(fieldName, text);
      let data = this.get("packageDetails");
      let newTag = {
        id: data[fieldName].length + 1,
        tag: text
      };
      data[fieldName].push({
        id: data[fieldName].length + 1,
        tag: text
      });
      this.set("selected", newTag);
      this.set("packageDetails", data);
      this.send("setSelected", fieldName, newTag);
    },

    setSelected(fieldName, value) {
      let optionObj = this.get("optionObject");
      optionObj[fieldName] = value.tag;
      this.set("optionObject", optionObj);
      this.get("onConfirm")(this.get("optionObject"));
      console.log(this.get("displayPage"));
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
              this.get("store").pushPayload(data);
              let selectedValuesObj = {
                ...this.get("selectedValuesDisplay")
              };
              selectedValuesObj[snakeCaseKey] = value.tag;
              console.log(selectedValuesObj);
              _this.set("selectedValuesDisplay", selectedValuesObj);
              console.log(this.get("selectedDataDisplay"), "updated");
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
