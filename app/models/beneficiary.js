import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  identityNumber: attr("string"),
  title: attr("string"),
  phoneNumber: attr("string"),
  identityTypeId: attr("number"),
  identityType: belongsTo("identityType", { async: false }),

  fullName: computed("firstName", "lastName", function() {
    return `${this.get(
      "title"
    )} ${this.get("firstName")} ${this.get("lastName")}`;
  }),

  mobileWithoutCountryCode: computed("mobile", function() {
    var phoneNumber = this.get("phoneNumber");
    return phoneNumber
      ? phoneNumber.indexOf("+852") >= 0
        ? phoneNumber.substring("4")
        : phoneNumber
      : "";
  }),

  fullNameWithoutTitle: computed("firstName", "lastName", function() {
    return `${this.get("firstName")} ${this.get("lastName")}`;
  })
});
