import Ember from "ember";
import _ from "lodash";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/location";
import MockUtils from "../helpers/mock-utils";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";

var App,
  order6,
  order7,
  item,
  item1,
  orders_package,
  orders_package1,
  orders_package2,
  orders_package3,
  item2,
  item3;

module("Acceptance: Order restart processing", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();

    order6 = FactoryGuy.make("designation", {
      state: "awaiting_dispatch",
      detailType: "GoodCity",
      code: "GC-00005"
    });
    order7 = FactoryGuy.make("designation", {
      state: "processing",
      detailType: "GoodCity",
      code: "GC-00005"
    });
    item = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order6
    });
    item1 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order6
    });
    item2 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order7
    });
    item3 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order7
    });
    orders_package = FactoryGuy.make("cancelled_orders_package", {
      item: item,
      designation: order6
    });
    orders_package1 = FactoryGuy.make("cancelled_orders_package", {
      item: item1,
      designation: order6
    });
    orders_package2 = FactoryGuy.make("cancelled_orders_package", {
      item: item2,
      designation: order7
    });
    orders_package3 = FactoryGuy.make("cancelled_orders_package", {
      item: item3,
      designation: order7
    });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    MockUtils.mockWithRecords(
      "cancellation_reason",
      _(3).times(() => FactoryGuy.make("cancellation_reason"))
    );

    mockFindAll("designation").returns({
      json: {
        designations: [order6.toJSON({ includeId: true })],
        items: [
          item.toJSON({ includeId: true }),
          item1.toJSON({ includeId: true }),
          item2.toJSON({ includeId: true }),
          item3.toJSON({ includeId: true })
        ],
        orders_packages: [
          orders_package.toJSON({ includeId: true }),
          orders_package1.toJSON({ includeId: true }),
          orders_package2.toJSON({ includeId: true }),
          orders_package3.toJSON({ includeId: true })
        ],
        meta: { search: order6.get("code").toString() }
      }
    });
    mockFindAll("orders_package").returns({
      json: {
        orders_packages: [
          orders_package.toJSON({ includeId: true }),
          orders_package1.toJSON({ includeId: true }),
          orders_package2.toJSON({ includeId: true }),
          orders_package3.toJSON({ includeId: true })
        ]
      }
    });
    MockUtils.mockWithRecords("goodcity_request", []);
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Clicking on restart process changes order state to processing", function(assert) {
  assert.expect(2);
  MockUtils.mock({
    url: "/api/v1/designations/*",
    type: "GET",
    status: 200,
    responseText: {
      designations: [order6.toJSON({ includeId: true })],
      orders_packages: [
        orders_package.toJSON({ includeId: true }),
        orders_package1.toJSON({ includeId: true })
      ]
    }
  });
  MockUtils.mock({
    url: "/api/v1/orders/" + order6.id + "/transitio*",
    type: "PUT",
    status: 200,
    responseText: {
      designations: [order7.toJSON({ includeId: true })],
      orders_packages: [
        orders_package2.toJSON({ includeId: true }),
        orders_package3.toJSON({ includeId: true })
      ]
    }
  });
  visit("/orders/" + order6.id + "/active_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
    click($(".order-option-ellipsis"));
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
  });
});
