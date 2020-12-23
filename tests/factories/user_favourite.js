import FactoryGuy from "ember-data-factory-guy";
import _ from "lodash";

FactoryGuy.define("user_favourite", {
  sequences: {
    id: function() {
      return _.uniqueId() + Math.floor(Math.random() * 100);
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    persistent: false,
    favourite_id: 1,
    favourite_type: "Package"
  }
});
export default {};
