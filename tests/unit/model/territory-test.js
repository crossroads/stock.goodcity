import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("territory", "Territory Model", {
  needs: ["model:territory", "model:district"]
});

test("check attributes", function(assert) {
  assert.expect(1);
  var model = this.subject();
  var name = Object.keys(model.toJSON()).indexOf("name") > -1;

  assert.ok(name);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var Territory = this.store().modelFor("territory");
  var relationshipWithDistrict = get(Territory, "relationshipsByName").get(
    "districts"
  );

  assert.equal(relationshipWithDistrict.key, "districts");
  assert.equal(relationshipWithDistrict.kind, "hasMany");
});
