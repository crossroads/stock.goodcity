import Ember from "ember";

export default Ember.Helper.helper(function(state) {
  switch (state[0]) {
    case "showPriority":
      return "exclamation-triangle";
    case "submitted":
      return "envelope";
    case "processing":
      return "list";
    case "scheduled":
      return "clock-o";
    case "dispatching":
      return "paper-plane";
    case "closed":
      return "thumbs-up";
    case "cancelled":
      return "thumbs-down";
    default:
      return "";
  }
});
