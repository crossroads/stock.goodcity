import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("addressable", "Addressable model", {
  needs: ["model:address"]
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var Addressable = this.store().modelFor("Addressable");
  var relationshipWithAddress = get(Addressable, "relationshipsByName").get(
    "address"
  );

  assert.equal(relationshipWithAddress.key, "address");
  assert.equal(relationshipWithAddress.kind, "belongsTo");
});
