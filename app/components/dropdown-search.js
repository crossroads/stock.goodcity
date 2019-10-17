import Ember from "ember";

export default Ember.Component.extend({
  selected: [],

  resourceType: Ember.computed.alias("packageDetails"),
  selectedData: Ember.computed.alias("selectedValue"),

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

    setSelected(fieldName, value) {
      const newOption = { [fieldName]: value.tag };
      this.get("onConfirm")(newOption);
    }
  }
});
