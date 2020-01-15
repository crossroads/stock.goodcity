import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("user_profile", "UserProfile Model", {
  needs: ["model:permission", "model:address", "model:user-role", "model:role"]
});

test("check attributes", function(assert) {
  assert.expect(3);
  var model = this.subject();
  var firstName = Object.keys(model.toJSON()).indexOf("firstName") > -1;
  var lastName = Object.keys(model.toJSON()).indexOf("lastName") > -1;
  var mobile = Object.keys(model.toJSON()).indexOf("mobile") > -1;

  assert.ok(firstName);
  assert.ok(lastName);
  assert.ok(mobile);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var UserProfile = this.store().modelFor("user_profile");
  var relationshipWithUserRoles = get(UserProfile, "relationshipsByName").get(
    "userRoles"
  );

  assert.equal(relationshipWithUserRoles.key, "userRoles");
  assert.equal(relationshipWithUserRoles.kind, "hasMany");
});

test("check fullName computedProperty", function(assert) {
  assert.expect(1);
  var model = this.subject({ firstName: "David", lastName: "Dara" });

  assert.equal(model.get("fullName"), "David Dara");
});

test("check mobileWithCountryCode computedProperty", function(assert) {
  assert.expect(1);
  var model = this.subject({ mobile: "611111" });

  assert.equal(model.get("mobileWithCountryCode"), "+852611111");
});
