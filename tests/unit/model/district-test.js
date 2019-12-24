import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("district", "District Model", {
  needs: ["model:territory"]
});

test("check attributes", function(assert) {
  var model = this.subject();
  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  var territory = Object.keys(model.toJSON()).indexOf("territory") > -1;

  assert.ok(name);
  assert.ok(territory);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var District = this.store().modelFor("district");
  var relationshipWithTerritory = get(District, "relationshipsByName").get(
    "territory"
  );

  assert.equal(relationshipWithTerritory.key, "territory");
  assert.equal(relationshipWithTerritory.kind, "belongsTo");
});
