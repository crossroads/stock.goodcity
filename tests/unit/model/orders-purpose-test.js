import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("orders_purpose", "OrdersPurpose Model", {
  needs: ["model:designation", "model:purpose"]
});

test("check attributes", function(assert) {
  assert.expect(2);
  var model = this.subject();
  var purposeId = Object.keys(model.toJSON()).indexOf("purposeId") > -1;
  var designationId = Object.keys(model.toJSON()).indexOf("designationId") > -1;

  assert.ok(purposeId);
  assert.ok(designationId);
});

test("Relationships with other models", function(assert) {
  assert.expect(4);
  var OrdersPurpose = this.store().modelFor("orders_purpose");
  var relationshipWithPurpose = get(OrdersPurpose, "relationshipsByName").get(
    "purpose"
  );
  var relationshipWithDesignation = get(
    OrdersPurpose,
    "relationshipsByName"
  ).get("designation");

  assert.equal(relationshipWithPurpose.key, "purpose");
  assert.equal(relationshipWithPurpose.kind, "belongsTo");

  assert.equal(relationshipWithDesignation.key, "designation");
  assert.equal(relationshipWithDesignation.kind, "belongsTo");
});
