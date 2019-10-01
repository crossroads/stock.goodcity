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
      // this.get("resourceType") << fieldName: newTag
      this.send("setSelected", newTag);
    },
    setSelected(selection) {
      console.log(selection, "hit");
    }
  }
});
