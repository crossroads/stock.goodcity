import { computed } from "@ember/object";
import { or } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  phoneNumber: attr("string"),
  mobilePhoneNumber: attr("string"),

  displayNumber: or("mobilePhoneNumber", "phoneNumber"),

  fullName: computed("firstName", "lastName", function() {
    return `${this.get("firstName")} ${this.get("lastName")}`;
  })
});
