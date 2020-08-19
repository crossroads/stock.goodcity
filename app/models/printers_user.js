import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  printerId: attr("number"),
  userId: attr("number"),
  tag: attr("string"),
  printer: belongsTo("printer", { async: false }),
  user: belongsTo("user", { async: false })
});
