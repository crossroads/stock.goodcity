import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import MockUtils from "../helpers/mock-utils";
import FactoryGuy from "ember-data-factory-guy";

var App, pkg;

module("Acceptance: Supervisor footer", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();
    MockUtils.mockUserProfile({}, { role: "Supervisor" });

    pkg = FactoryGuy.make("item", {
      id: 50,
      state: "submitted",
      quantity: 1,
      height: 10,
      width: 15,
      length: 20,
      notes: "Inline edit test"
    });
    visit("/");

    $.mockjax({
      url: "/api/v1/item*",
      type: "GET",
      status: 200,
      responseText: {
        items: [pkg.toJSON({ includeId: true })]
      }
    });
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
      $("ul.list li.menu")
        .text()
        .trim(),
      "Menu"
    );
  });
});
