import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("user", "User Model", {
  needs: [
    "service:i18n",
    "model:permission",
    "model:user",
    "model:address",
    "model:user-role",
    "model:role",
    "model:organisation",
    "model:organisations-user",
    "model:printer"
  ]
});

test("check attributes", function(assert) {
  assert.expect(4);
  var model = this.subject();
  var firstName = Object.keys(model.toJSON()).indexOf("firstName") > -1;
  var lastName = Object.keys(model.toJSON()).indexOf("lastName") > -1;
  var mobile = Object.keys(model.toJSON()).indexOf("mobile") > -1;
  var createdAt = Object.keys(model.toJSON()).indexOf("createdAt") > -1;

  assert.ok(firstName);
  assert.ok(lastName);
  assert.ok(mobile);
  assert.ok(createdAt);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var User = this.store().modelFor("user");
  var relationshipWithUserRoles = Ember.get(User, "relationshipsByName").get(
    "userRoles"
  );

  assert.equal(relationshipWithUserRoles.key, "userRoles");
  assert.equal(relationshipWithUserRoles.kind, "hasMany");
});

test("check displayNumber computedProperty", function(assert) {
  var model = this.subject();
  Ember.run(function() {
    model.set("firstName", "David");
    model.set("lastName", "Dara");
  });

  assert.equal(model.get("fullName"), "David Dara");
});
