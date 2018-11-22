import Ember from "ember";

export default Ember.Helper.helper(function(type) {
  switch (type[0]) {
    case "online_orders":
      return "";
    case "appointments":
      return "fa fa-handshake-o";
    case "collection":
      return "fa fa-male";
    case "dispatch":
      return "fa fa-truck";
    case "shipments":
      return "fa fa-ship";
    case "others":
      return "fa fa-list-alt";
    default:
      return "";
  }
});
