import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  designation: belongsTo("designation", {
    async: false
  }),
  orderId: attr("number"),
  processChecklist: belongsTo("booking_type", {
    async: false
  }),
  processChecklistId: attr("number")
});
