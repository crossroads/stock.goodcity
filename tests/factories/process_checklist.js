import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("process_checklist", {
  sequences: {
    id: function(num) {
      return num + 150;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    text_en: "Lorem ipsum",
    bookingTypeId: "1"
  }
});
