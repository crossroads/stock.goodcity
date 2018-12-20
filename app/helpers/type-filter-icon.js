import Ember from "ember";

export default Ember.Helper.helper(function(type) {
  switch (type[0]) {
    case "online_orders":
      return "";
    case "appointment":
      return "fa fa-handshake-o";
    case "online_orders_pickup":
      return "fa fa-male";
    case "online_orders_ggv":
      return "fa fa-truck";
    case "shipment":
      return "fa fa-ship";
    case "other":
      return "fa fa-list-alt";
    default:
      return "";
  }
});
