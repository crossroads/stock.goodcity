import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  i18n: service(),
  gogovanOrderId: attr("number"),
  gogovanTransportId: attr("number"),
  timeslot: attr("string"),
  transportType: attr("string"),
  vehicleType: attr("string"),
  scheduledAt: attr("string"),
  orderId: attr("string"),
  contact: belongsTo("contact", { async: false }),
  designation: belongsTo("designation", { async: false }),
  needEnglish: attr("boolean"),
  needCart: attr("boolean"),
  needCarry: attr("boolean"),
  gogovanTransport: belongsTo("gogovan_transport", { async: false }),

  scheduledDate: computed("scheduledAt", function() {
    return moment(this.get("scheduledAt")).format("D MMMM YYYY");
  }),

  type: computed("transportType", function() {
    var type = this.get("transportType");
    if (type === "ggv") {
      return type.toUpperCase();
    } else if (type === "self") {
      return type.charAt(0).toUpperCase() + type.slice(1);
    } else {
      return "";
    }
  })
});
