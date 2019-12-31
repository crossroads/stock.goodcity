import FactoryGuy from "ember-data-factory-guy";
var reason_list = ["No show", "Nothing suitable", "Changed mind", "Other"];

FactoryGuy.define("cancellation_reason", {
  sequences: {
    name: function() {
      return reason_list[Math.floor(Math.random() * reason_list.length)];
    }
  },
  default: {
    name: FactoryGuy.generate("name")
  }
});

export default {};
