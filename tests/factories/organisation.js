import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("organisation", {
  sequences: {
    id: function(num) {
      return num;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    nameEn: "GoodCity",
    organisationsUsers: FactoryGuy.hasMany("organisationsUser"),
    designations: FactoryGuy.hasMany("designation")
  }
});
