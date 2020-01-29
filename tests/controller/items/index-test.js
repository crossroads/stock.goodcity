import { run } from "@ember/runloop";
import { test, moduleFor } from "ember-qunit";
import startApp from "../../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";

var App;

moduleFor("controller:items.index", "items.index controller", {
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
  },
  afterEach: function() {
    run(function() {
      TestHelper.teardown();
    });
    run(App, "destroy");
  }
});

test("Checking for default set values", function(assert) {
  assert.expect(1);

  var ctrl = this.subject();

  assert.equal(ctrl.get("searchModelName"), "item");
});
