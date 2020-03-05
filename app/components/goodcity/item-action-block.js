import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  actionIconsList: {
    process: "random",
    recycle: "recycle",
    trash: "dumpster",
    loss: "folder-minus"
  },

  actionIcon: Ember.computed("action.action", function() {
    return this.get("actionIconsList")[this.get("action.action")];
  }),

  actionTitle: Ember.computed("action.action", function() {
    let actionName = this.get("action.action");

    switch (actionName) {
      case "trash":
        return "Trashed";
      case "recycle":
        return "Recycled";
      case "process":
        return "Processed";
      case "loss":
        return (
          "Loss - Rolling stock take - " + this.get("action.location.name")
        );
      default:
        return "NOT APPLICABLE";
    }
  }),

  actions: {}
});
