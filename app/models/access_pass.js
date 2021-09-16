import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  generatedAt: attr("string"),
  accessKey: attr("string"),
  roleIds: attr("string"),
  printerId: attr("number"),
  accessExpiresAt: attr("string")
});
