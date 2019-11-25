import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  nameEn: attr("string"),
  nameZhTw: attr("string"),
  stockitId: attr("number"),
  createdAt: attr("date"),
  updatedAt: attr("date")
});
