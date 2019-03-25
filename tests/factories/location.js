import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("location", {
  sequences: {
    id: function() {
      return Math.floor(Math.random() * 100);
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
