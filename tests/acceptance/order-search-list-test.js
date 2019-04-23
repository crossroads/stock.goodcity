import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import MockUtils from "../helpers/mock-utils";
import FactoryGuy, { mockFindAll } from "ember-data-factory-guy";

var App, designation, item, orders_package, bookingType;

module("Acceptance: Order search list", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();

    designation = FactoryGuy.make("designation", {
      detailType: "GoodCity"
    });
    item = FactoryGuy.make("item", { state: "submitted" });
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      item: item,
      designation: designation
    });

    MockUtils.mock({
      url: "/api/v1/designation*",
      responseText: {
        designations: [designation.toJSON({ includeId: true })],
        items: [item.toJSON({ includeId: true })],
        orders_packages: [orders_package.toJSON({ includeId: true })],
        meta: { search: designation.get("code") },
        designation: designation.toJSON({ includeId: true })
      }
    });

    mockFindAll("designation").returns({
      json: {
        designations: [designation.toJSON({ includeId: true })],
        items: [item.toJSON({ includeId: true })],
        orders_packages: [orders_package.toJSON({ includeId: true })],
        meta: { search: designation.get("code") }
      }
    });

    mockFindAll("orders_package").returns({
      json: { orders_packages: [orders_package.toJSON({ includeId: true })] }
    });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });
  },
  afterEach: function() {
    // Clear our ajax mocks
    MockUtils.closeSession();

    // Stop the app
    Ember.run(App, "destroy");
  }
});

// ------ Helpers

function searchOrders(assert) {
  visit("/orders/");

  andThen(function() {
    assert.equal(
      currentPath(),
      "orders.index",
      "Should be on the order listing page"
    );
    assert.equal(
      Ember.$("#searchText").length,
      1,
      "Should have an input field"
    );
    fillIn("#searchText", designation.get("code"));
  });

  andThen(function() {
    assert.equal(
      Ember.$(".loading_screen").length,
      0,
      "Should hide the loading screen"
    );
    assert.equal(
      Ember.$(".order_block").length,
      1,
      "Should have one item displayed"
    );
  });
}

// ------ Tests

test("Clicking on an order should redirect to the order details page", function(assert) {
  assert.expect(5);

  searchOrders(assert);

  andThen(() => {
    click(Ember.$(".order_block")[0]);
  });

  andThen(() => {
    assert.equal(
      currentURL(),
      `/orders/${designation.get("id")}/active_items`,
      "Should be on the order details page"
    );
  });
});

test("Order codes should be displayed on screen", function(assert) {
  assert.expect(5);

  searchOrders(assert);

  andThen(function() {
    assert.equal(
      find(".order_code")
        .text()
        .trim(),
      designation.get("code"),
      "Should be displaying the order code"
    );
  });
});

test("Order's state should be displayed on screen", function(assert) {
  assert.expect(5);

  searchOrders(assert);

  andThen(function() {
    assert.equal(
      find(".order_state_text")
        .text()
        .trim()
        .toLowerCase(),
      designation.get("state"),
      "Should be displaying the order's state"
    );
  });
});
