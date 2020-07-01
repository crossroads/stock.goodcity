import Ember from "ember";

export default Ember.Helper.helper(function(data) {
  const [type, value] = data;
  switch (type) {
    case "expiry_date":
      return moment(value).format("LLL");
    default:
      return value;
  }
});
