import { test, moduleFor } from "ember-qunit";
import "../factories/location";

moduleFor("controller:select_location", "select_location controller", {
  needs: ["service:intl"]
});

test("checking default set properties", function(assert) {
  assert.expect(2);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get("sortProperties")[0], "createdAt:desc");
  assert.equal(ctrl.get("searchModelName"), "location");
});
