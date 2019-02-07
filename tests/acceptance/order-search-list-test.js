import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import FactoryGuy, { mockFindAll } from "ember-data-factory-guy";

var App, designation, item, orders_package, user, bookingType;
var mocks;

module("Acceptance: Order search list", {
  beforeEach: function() {
    App = startApp({}, 2);
    user = FactoryGuy.make("user", { mobile: "123456", email: "abc@xyz", firstName: "John", lastName: "Lennon", id: 5 });
    designation = FactoryGuy.make("designation", {
      detailType: 'GoodCity'
    });
    item = FactoryGuy.make("item", { state: "submitted" });
    var location = FactoryGuy.make("location");
    bookingType = FactoryGuy.make("booking_type");
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      item: item,
      designation: designation,
    });

    var userProfile = {
      user_profile: [{
        id: 2,
        first_name: "David",
        last_name: "Dara51",
        mobile: "61111111",
        user_role_ids: [1]
      }],
      users: [{ id: 2, first_name: "David", last_name: "Dara51", mobile: "61111111" }, user.toJSON({ includeId: true })],
      roles: [{ id: 4, name: "Supervisor" }],
      user_roles: [{ id: 1, user_id: 2, role_id: 4 }]
    };

    $.mockjaxSettings.matchInRegistrationOrder = false;

    mocks = [];

    mocks.push(
      $.mockjax({
        url: "/api/v1/auth/current_user_profil*",
        responseText: userProfile
      })
    );

    mocks.push(
      $.mockjax({
        url: "/api/v1/designation*",
        responseText: {
          designations: [designation.toJSON({ includeId: true })],
          items: [item.toJSON({ includeId: true })],
          orders_packages: [orders_package.toJSON({ includeId: true })],
          meta: { search: designation.get("code") },
          designation: designation.toJSON({ includeId: true })
        }
      }),
      $.mockjax({url:"/api/v1/orders/summar*", responseText: {
        "submitted":14,
        "awaiting_dispatch":1,
        "dispatching":1,
        "processing":2,
        "priority_submitted":14,
        "priority_dispatching":1,
        "priority_processing":2,
        "priority_awaiting_dispatch":1
      }})
    );

    mockFindAll('designation').returns({ json: {
      designations: [designation.toJSON({ includeId: true })],
      items: [item.toJSON({ includeId: true })],
      orders_packages: [orders_package.toJSON({ includeId: true })],
      meta: { search: designation.get("code") }
    }});

    mockFindAll('orders_package').returns({ json: {orders_packages: [orders_package.toJSON({includeId: true})]}});
    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    mockFindAll("booking_type").returns({json: {booking_types: [bookingType.toJSON({includeId: true})]}});


    visit("/");

    andThen(function() {
      visit("/orders/");
    });

  },
  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    // Stop the app
    Ember.run(App, "destroy");
  }
});

// ------ Helpers

function searchOrders(assert) {

  visit("/orders/");

  andThen(function () {
    assert.equal(currentPath(), "orders.index", "Should be on the order listing page");
    assert.equal(Ember.$('#searchText').length, 1, "Should have an input field");
    fillIn("#searchText", designation.get("code"));
  });

  andThen(function () {
    assert.equal(Ember.$('.loading_screen').length, 0, "Should hide the loading screen");
    assert.equal(Ember.$('.order_block').length, 1, "Should have one item displayed");
  });
}

// ------ Tests

test("Clicking on an order should redirect to the order details page", function (assert) {
  assert.expect(5);

  searchOrders(assert);

  andThen(() => {
    click(Ember.$('.order_block')[0]);
  });

  andThen(() => {
    assert.equal(currentURL(), `/orders/${designation.get("id")}/active_items`, "Should be on the order details page");
  });

});

test("Order codes should be displayed on screen", function(assert) {
  assert.expect(5);

  searchOrders(assert);

  andThen(function() {
    assert.equal(
      find(".order_code").text().trim(),
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
      find(".order_state_text").text().trim().toLowerCase(),
      designation.get("state"),
      "Should be displaying the order's state"
    );
  });
});

