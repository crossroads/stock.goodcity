import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  favourite_type: attr("string"),
  favourite_id: attr("number"),
  user_id: attr("number"),
  persistent: attr("boolean", { defaultValue: false })
});
