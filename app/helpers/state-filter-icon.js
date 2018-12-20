import Ember from "ember";

export default Ember.Helper.helper(function(state) {
  switch (state[0]) {
    case "showPriority":
      return "fa fa-exclamation-triangle";
    case "submitted":
      return "fa fa-envelope";
    case "processing":
      return "fa fa-list";
    case "awaiting_dispatch":
      return "fa fa-clock-o";
    case "dispatching":
      return "fa fa-paper-plane";
    case "closed":
      return "fa fa-thumbs-up";
    case "cancelled":
      return "fa fa-thumbs-down";
    default:
      return "";
  }
});
