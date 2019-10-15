2;
import Ember from "ember";

export default Ember.Component.extend({
  selected: [],

  resourceType: Ember.computed.alias("packageDetails"),
  selectedData: Ember.computed.alias("selectedValue"),

  actions: {
    addNew(fieldName, text) {
      let packageDetails = this.get("packageDetails");
      const newTag = {
        id: packageDetails[fieldName].length + 1,
        tag: text
      };
      this.set("selected", newTag);
      this.set("packageDetails", packageDetails[fieldName].push(newTag));
      this.send("setSelected", fieldName, newTag);
    },

    setSelected(fieldName, value) {
      const newOption = { [fieldName]: value.tag };
      this.get("onConfirm")(newOption);
    }
  }
});
