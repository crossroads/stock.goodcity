import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("code", "Code model", {
  needs: ["model:location"]
});

test("check attributes", function(assert) {
  assert.expect(5);
  var model = this.subject();
  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  var code = Object.keys(model.toJSON()).indexOf("code") > -1;
  var visibleInSelects =
    Object.keys(model.toJSON()).indexOf("visibleInSelects") > -1;
  var defaultChildPackages =
    Object.keys(model.toJSON()).indexOf("defaultChildPackages") > -1;
  var otherChildPackages =
    Object.keys(model.toJSON()).indexOf("otherChildPackages") > -1;

  assert.ok(name);
  assert.ok(code);
  assert.ok(visibleInSelects);
  assert.ok(defaultChildPackages);
  assert.ok(otherChildPackages);
});

test("Relationship with other models", function(assert) {
  assert.expect(2);
  var Code = this.store().modelFor("code");
  var relationshipWithLocation = get(Code, "relationshipsByName").get(
    "location"
  );

  assert.equal(relationshipWithLocation.key, "location");
  assert.equal(relationshipWithLocation.kind, "belongsTo");
});

test("check defaultChildPackagesList computedProperty", function(assert) {
  assert.expect(1);

  var model = this.subject({
    code: "BBS",
    defaultChildPackages: "BBS",
    otherChildPackages: "FXX"
  });

  assert.equal(model.defaultChildPackagesList().length, 1);
});

test("check otherChildPackagesList computedProperty", function(assert) {
  assert.expect(1);

  var model = this.subject({
    code: "BBS",
    defaultChildPackages: "BBS",
    otherChildPackages: "FXX"
  });

  assert.equal(model.otherChildPackagesList().length, 0);
});

test("check allChildPackagesList computedProperty", function(assert) {
  assert.expect(1);

  var model = this.subject({
    code: "BBS",
    defaultChildPackages: "BBS",
    otherChildPackages: "FXX"
  });

  assert.equal(model.allChildPackagesList().length, 1);
});
