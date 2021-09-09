import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Ember from "ember";

export default Model.extend({
  generatedAt: attr("string"),
  accessKey: attr("string"),
  roleIds: attr("string"),
  printerId: attr("number"),
  accessExpiresAt: attr("string")

  // printer:    belongsTo('printer', { async: false }),
});
