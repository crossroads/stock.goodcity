import FactoryGuy from "ember-data-factory-guy";
import _ from "lodash";

FactoryGuy.define("location", {
  sequences: {
    id: function() {
      return _.uniqueId() + Math.floor(Math.random() * 1000);
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    building: FactoryGuy.generate(function(num) {
      return "building" + num;
    }),

    area: FactoryGuy.generate(function(num) {
      return "area" + num;
    })
  }
});

export default {};
