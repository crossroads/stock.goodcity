import { test, moduleFor } from "ember-qunit";
import startApp from "../../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";
import Ember from "ember";

var App;

moduleFor("controller:items.index", "items.index controller", {
  needs: ["service:session"],
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
  },
  afterEach: function() {
    Ember.run(function() {
      TestHelper.teardown();
    });
    Ember.run(App, "destroy");
  }
});

test("Checking for default set values", function(assert) {
  assert.expect(1);

  var ctrl = this.subject();

  assert.equal(ctrl.get("searchModelName"), "item");
});
