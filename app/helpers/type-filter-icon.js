import Ember from "ember";

export default Ember.Helper.helper(function(type) {
  switch (type[0]) {
    case "in_stock":
      return "th-list";
    case "designated":
      return "shopping-basket";
    case "online_orders":
      return "desktop";
    case "trash":
      return "dumpster";
    case "loss":
      return "folder-minus";
    case "recycle":
      return "recycle";
    case "process":
      return "random";
    case "pack":
      return "box-open";
    case "appointment":
      return "warehouse";
    case "online_orders":
      return "desktop";
    case "dispatched":
    case "shipment":
      return "ship";
    case "other":
      return "list-alt";
    default:
      return "";
  }
});
