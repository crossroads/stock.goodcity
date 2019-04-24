import { test, moduleFor } from "ember-qunit";

moduleFor("controller:orders.index", "orders.index controller", {
  needs: ["service:i18n"]
});

test("checking default set properties", function(assert) {
  assert.expect(3);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get("searchModelName"), "designation");
  assert.equal(ctrl.get("unloadAll"), false);
  assert.equal(ctrl.get("minSearchTextLength"), 2);
});
