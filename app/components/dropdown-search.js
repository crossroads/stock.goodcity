2;
import Ember from "ember";

export default Ember.Component.extend({
  // classNames: "Example",
  selected: [],
  selectedTags: [],
  optionObject: {},
  selectedOptionData: " ",
  disbale: true,

  resourceType: Ember.computed("packageDetails", function() {
    return this.get("packageDetails");
  }),

  selectedData: Ember.computed("selectedValues", function() {
    return this.get("selectedValues");
  }),

  selectedDataDisplay: Ember.computed("selectedValuesDisplay", function() {
    return this.get("selectedValuesDisplay");
  }),

  displayPage: Ember.computed("displayPage", function() {
    return this.get("displayPage");
  }),

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
    }
  }
});
