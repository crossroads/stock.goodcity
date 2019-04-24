import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import MockUtils from "../helpers/mock-utils";

var App;

module("Acceptance: Supervisor footer", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();
    MockUtils.mockUserProfile({}, { role: "Supervisor" });

    visit("/");
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Menu icon stay visible after switching tab from orders to item", function(assert) {
  visit("/orders");
  assert.expect(2);
  andThen(function() {
    visit("/items");
  });
  andThen(function() {
    assert.equal(currentPath(), "items.index");
    assert.equal(
      $("ul.list li:last")
        .text()
        .trim(),
      "Menu"
    );
  });
});
