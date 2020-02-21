import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  offerId: attr("number"),
  itemId: attr("number"),
  item: belongsTo("item", { async: false }),
  offer: belongsTo("offer", { async: true })
});
