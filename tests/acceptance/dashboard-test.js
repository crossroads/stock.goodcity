import Ember from "ember";
import _ from "lodash";
import startApp from "../helpers/start-app";
import { module, test } from "qunit";
import "../factories/designation";
import "../factories/location";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
import MockUtils from "../helpers/mock-utils";

var App, data, userData, bookingType, designations, users;

module("Acceptance: Dashboard", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockEmptyPreload();
    MockUtils.mockEmpty("order_transport");
    MockUtils.mockUserProfile();
    MockUtils.mockOrderSummary({
      submitted: 1,
      awaiting_dispatch: 4,
      dispatching: 4,
      processing: 2,
      priority_awaiting_dispatch: 4,
      priority_dispatching: 2,
      priority_submitted: 3,
      priority_processing: 1
    });

    var location = FactoryGuy.make("location");
    bookingType = FactoryGuy.make("booking_type");
    users = _.range(1, 6).map(() => FactoryGuy.make("user"));
    designations = _.range(1, 6).map((order, index) =>
      FactoryGuy.make("designation", {
        state: "submitted",
        createdBy: users[index],
        detail_type: "GoodCity"
      }).toJSON({
        includeId: true
      })
    );

    MockUtils.mock({
      url: "/api/v1/designat*",
      responseText: { designations: designations }
    });
    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });

    visit("/");

    andThen(() => {
      visit("/orders");
    });
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Order fulfilment user can view dashboard element", function(assert) {
  assert.expect(2);

  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal(Ember.$(".recent_orders").length, 2);
  });
});

test("Showing count of each type of Order type", function(assert) {
  assert.expect(9);

  visit("/");
  andThen(function() {
    //Non-priority Orders count
    assert.equal(currentURL(), "/");
    assert.equal(
      $(".submitted span")
        .eq(0)
        .text()
        .trim(),
      1
    );
    assert.equal(
      $(".processing span")
        .eq(0)
        .text()
        .trim(),
      2
    );
    assert.equal(
      $(".awaiting_dispatch span")
        .eq(0)
        .text()
        .trim(),
      4
    );
    assert.equal(
      $(".dispatching span")
        .eq(0)
        .text()
        .trim(),
      4
    );

    //Non-priority Orders count
    assert.equal(
      $(".submitted span")
        .eq(1)
        .text()
        .trim(),
      3
    );
    assert.equal(
      $(".processing span")
        .eq(1)
        .text()
        .trim(),
      1
    );
    assert.equal(
      $(".awaiting_dispatch span")
        .eq(1)
        .text()
        .trim(),
      4
    );
    assert.equal(
      $(".dispatching span")
        .eq(1)
        .text()
        .trim(),
      2
    );
  });
});

test("Clicking order type redirects to order page with order type list populated", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    click(Ember.$(".submitted")[0]);
    andThen(function() {
      assert.equal(currentURL(), "/orders?preload=true");
    });
  });
});

test("Clicking order type redirects to order page and selects filter of clicked order type", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    click(Ember.$(".submitted")[0]);
    andThen(function() {
      assert.equal(currentURL(), "/orders?preload=true");
      assert.equal(
        Ember.$("#order-state-filter")
          .text()
          .trim(),
        "Submitted"
      );
    });
  });
});

test("Generates 5 recent orders", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal($(".order_header").length, 5);
  });
});

test("Recent Orders displays orders code", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal(
      $(".order_code:first")
        .text()
        .trim(),
      designations[0].code
    );
  });
});

test("Recent Orders displays created by user name", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal(
      $(".order_user_name:first")
        .text()
        .trim(),
      users[0].get("fullName")
    );
  });
});
