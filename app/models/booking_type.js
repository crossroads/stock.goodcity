import { not } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  i18n: service(),
  nameEn: attr("string"),
  nameZh: attr("string"),
  identifier: attr("string"),

  isAppointment: computed("identifier", function() {
    const name = this.get("identifier") && this.get("identifier").toLowerCase();
    return name === "appointment";
  }),

  isOnlineOrder: not("isAppointment"),

  displayName: computed("isAppointment", function() {
    return this.get("i18n").t(
      `order_transports.${
        this.get("isAppointment") ? "appointment" : "online_order"
      }`
    );
  })
});
