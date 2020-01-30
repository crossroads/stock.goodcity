import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("address", "Address model", {
  needs: ["model:addressable", "model:district"]
});

test("check attributes", function(assert) {
  assert.expect(5);
  var model = this.subject();
  var flat = Object.keys(model.toJSON()).indexOf("flat") > -1;
  var building = Object.keys(model.toJSON()).indexOf("building") > -1;
  var street = Object.keys(model.toJSON()).indexOf("street") > -1;
  var addressType = Object.keys(model.toJSON()).indexOf("addressType") > -1;
  var addressableType =
    Object.keys(model.toJSON()).indexOf("addressableType") > -1;

  assert.ok(flat);
  assert.ok(building);
  assert.ok(street);
  assert.ok(addressType);
  assert.ok(addressableType);
});

test("Relationships with other models", function(assert) {
  assert.expect(4);
  var Address = this.store().modelFor("Address");
  var relationshipWithAddressable = get(Address, "relationshipsByName").get(
    "addressable"
  );
  var relationshipWithDistrict = get(Address, "relationshipsByName").get(
    "district"
  );

  assert.equal(relationshipWithAddressable.key, "addressable");
  assert.equal(relationshipWithAddressable.kind, "belongsTo");
  assert.equal(relationshipWithDistrict.key, "district");
  assert.equal(relationshipWithDistrict.kind, "belongsTo");
});

test("check fullAddress computedProperty", function(assert) {
  assert.expect(1);

  var model = this.subject({
    flat: "24",
    building: "Crossroads",
    street: "Tai chung"
  });

  assert.equal(model.get("fullAddress"), "24 Crossroads Tai chung");
});
