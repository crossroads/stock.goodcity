2;
import Ember from "ember";

export default Ember.Component.extend({
  // classNames: "Example",
  selected: [],
  selectedTags: [],
  optionObject: {},
  selectedOptionData: " ",

  resourceType: Ember.computed("packageDetails", function() {
    console.log(this.get("packageDetails"), "hit123");
    return this.get("packageDetails");
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
      console.log(data, "new");
      this.set("packageDetails", data);
      this.send("setSelected", fieldName, newTag);
    },
    setSelected(fieldName, value) {
      let optionObj = this.get("optionObject");
      optionObj[fieldName] = value.tag;
      this.set("optionObject", optionObj);
      console.log(this.get("optionObject"));
      this.get("onConfirm")(this.get("optionObject"));
    }
  }
});
