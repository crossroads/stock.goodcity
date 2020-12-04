import Ember from "ember";
import _ from "lodash";
import { module, test, skip } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/goodcity_request";
import "../factories/location";
import "../factories/code";
import MockUtils from "../helpers/mock-utils";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";

var App, designation1, request, code, requestCreated;

module("Acceptance: Goodcity Request test", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();
    MockUtils.mockEmpty("order_transport");

    requestCreated = false;

    designation1 = FactoryGuy.make("designation", {
      state: "processing",
      detailType: "GoodCity",
      code: "GC-00001"
    });
    var location = FactoryGuy.make("location");
    var bookingType = FactoryGuy.make("booking_type");
    code = FactoryGuy.make("code", { location: location });

    request = FactoryGuy.make("goodcity_request", {
      quantity: 1,
      designation: designation1,
      code: code
    });

    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
    });

    MockUtils.mockWithRecords(
      "cancellation_reason",
      _(3).times(() => FactoryGuy.make("cancellation_reason"))
    );

    MockUtils.mock({
      url: "/api/v1/goodcity_request*",
      type: "POST",
      status: 201,
      response: () => {
        requestCreated = true;
        return { goodcity_requests: [request.toJSON({ includeId: true })] };
      }
    });
    mockFindAll("designation").returns({
      json: {
        designations: [designation1.toJSON({ includeId: true })],
        items: [],
        orders_packages: [],
        meta: { search: designation1.get("code").toString() }
      }
    });
    mockFindAll("orders_package").returns({ json: { orders_packages: [] } });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    MockUtils.mock({
      url: "/api/v1/package_type*",
      type: "GET",
      status: 200,
      responseText: {
        codes: [code.toJSON({ includeId: true })]
      }
    });

    MockUtils.mock({
      url: "/api/v1/user_favourite*",
      type: "GET",
      status: 200,
      responseText: {
        user_favourites: [
          {
            id: 1,
            favourite_type: "PackageType",
            favourite_id: code.get("id"),
            user_id: MockUtils.getSessionUser().id
          }
        ]
      }
    });

    MockUtils.mock({
      url: "/api/v1/message*",
      type: "GET",
      status: 200,
      responseText: {
        messages: []
      }
    });

    MockUtils.mock({
      url: "/api/v1/designations/*",
      type: "GET",
      status: 200,
      responseText: {
        designations: [designation1.toJSON({ includeId: true })],
        orders_packages: []
      }
    });

    visit("/");
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Add a request to order", function(assert) {
  assert.expect(2);
  MockUtils.mock({
    url: "/api/v1/designations/*",
    type: "GET",
    status: 200,
    responseText: {
      designations: [designation1.toJSON({ includeId: true })],
      orders_packages: []
    }
  });

  visit("/orders/" + designation1.id + "/requested_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
    //clicking on Add request button
    click($("#requestbtn")[0]);
  });

  andThen(function() {
    //click on first package_type
    click(find(".list li:first")[0]);
  });

  andThen(function() {
    assert.equal(requestCreated, true);
  });
});

test("Deleting request from order", function(assert) {
  assert.expect(2);

  visit("/orders/" + designation1.id + "/requested_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
    //clicking on Add request button
    click($(".fa-times-circle")[0]);
  });

  andThen(function() {
    click($("#messageBox #btn1"));
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
  });
});

// test("Editing Request", function(assert) {
//   assert.expect(2);
//   //filling same description
//   fillIn($('#qty' + request.id)[0], 1);
//   //clicking on qty to fire focusOut event of input
//   click('.request-quantity');
//   assert.equal(request.get('quantity'), 1);
//   fillIn($('#desc' + request.id)[0], "Test");
//   //clicking on qty to fire focusOut event of input
//   click('.request-quantity');
//   assert.equal(request.get('description'), "Test");
// });
