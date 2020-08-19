import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  user: hasMany("user", {
    async: false
  }),
  printersUsers: hasMany("printersUsers", { async: false })
});
