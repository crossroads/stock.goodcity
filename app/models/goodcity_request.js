import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  quantity: attr("string"),
  description: attr("string"),
  itemSpecifics: attr("string"),
  designationId: attr("string"),
  codeId: attr("string"),
  code: belongsTo("code", { async: false }),
  designation: belongsTo("designation", { async: false })
});
