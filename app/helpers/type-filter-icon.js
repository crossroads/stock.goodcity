import Ember from "ember";

export default Ember.Helper.helper(function(type) {
  switch (type[0]) {
    case "online_orders":
      return "";
    case "appointments":
      return "handshake-o";
    case "collection":
      return "male";
    case "dispatch":
      return "truck";
    case "shipments":
      return "ship";
    case "others":
      return "list-alt";
    default:
      return "";
  }
});
