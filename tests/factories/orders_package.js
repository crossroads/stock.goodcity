import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("orders_package", {
  sequences: {
    id: function(num) {
      return num + 100;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    quantity: 1,
    dispatchedQuantity: 0,
    sentOn: "",
    state: "",
    designationId: "",
    item: FactoryGuy.belongsTo("item"),
    designation: FactoryGuy.belongsTo("designation")
  },
  cancelled_orders_package: {
    id: FactoryGuy.generate("id"),
    quantity: 1,
    dispatchedQuantity: 0,
    state: "cancelled",
    item: FactoryGuy.belongsTo("item"),
    designation: FactoryGuy.belongsTo("designation")
  }
});
export default {};
