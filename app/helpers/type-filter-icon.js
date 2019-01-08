import Ember from "ember";

export default Ember.Helper.helper(function(type) {
switch (type[0]) {
    case "in_stock":
      return "th-list";
    case "designated":
      return "shopping-basket";
    case "online_orders":
      return "";
    case "appointment":
      return "handshake";
    case "online_orders_pickup":
      return "male";
    case "online_orders_ggv":
      return "truck";
    case "dispatched":
    case "shipment":
      return "ship";
    case "other":
      return "list-alt";
    default:
      return "";
  }
});
