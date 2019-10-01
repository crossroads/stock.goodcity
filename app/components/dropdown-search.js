2;
import Ember from "ember";

export default Ember.Component.extend({
  // classNames: "Example",
  selected: [],
  talkTags: [
    {
      id: 0,
      tag: "ele"
    },
    {
      id: 1,
      tag: "ele123"
    }
  ],
  selectedTags: [],
  optionObject: {},
  numTags: Ember.computed.alias("talkTags.length"),
  selectedOptionData: " ",

  resourceType: Ember.computed("packageDetails", function() {
    console.log(this.get("packageDetails"), "hit123");
    return this.get("packageDetails");
  }),

  actions: {
    addNew(fieldName, text) {
      this.set(fieldName, text);
      let newTag = {
        id: this.get("numTags"),
        tag: text
      };
      this.set("selected", newTag);
      console.log(this.get("packageDetails"), "hit");
      let data = this.get("packageDetails");
      data[fieldName].push({
        id: data[fieldName].length + 1,
        tag: text
      });
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
