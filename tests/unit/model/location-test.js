import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("location", "Location Model", {
  needs: ["model:item", "model:packages_location", "model:location"]
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var Location = this.store().modelFor("location");
  var relationshipWithItem = get(Location, "relationshipsByName").get("items");

  assert.equal(relationshipWithItem.key, "items");
  assert.equal(relationshipWithItem.kind, "hasMany");
});

test("Checking computed properties", function(assert) {
  assert.expect(2);
  var location = this.subject({ area: 24, building: "Office" });
  assert.equal(location.get("name"), "Office-24");
  assert.equal(location.get("displayName"), "Office24");
});
