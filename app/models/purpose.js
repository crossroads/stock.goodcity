import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Model from "ember-data/model";
import attr from "ember-data/attr";

const TRANSLATION_KEYS = {
  trade: "order.for_charity_sale",
  organisation: "order.for_our_charity",
  client: "order.for_client"
};

export default Model.extend({
  i18n: service(),

  nameEn: attr("string"),
  nameZhTw: attr("string"),
  identifier: attr("string"),

  description: computed("nameEn", function() {
    const name = this.get("nameEn");
    return name && this.get("i18n").t(TRANSLATION_KEYS[name.toLowerCase()]);
  })
});
