import { test, moduleFor } from "ember-qunit";

moduleFor("controller:orders.index", "orders.index controller", {
  needs: ["service:intl"]
});

test("checking default set properties", function(assert) {
  assert.expect(2);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get("displayResults"), false);
  assert.equal(ctrl.get("minSearchTextLength"), 2);
});
