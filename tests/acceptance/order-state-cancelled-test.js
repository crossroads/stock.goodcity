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
  order5,
  order6,
  item,
  item1,
  orders_package,
  orders_package1,
  orders_package2,
  orders_package3,
  item2,
  item3;

module("Acceptance: Order State cancelled", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();

    order5 = FactoryGuy.make("designation", {
      state: "dispatching",
      detailType: "GoodCity",
      code: "GC-00001"
    });
    order6 = FactoryGuy.make("designation", {
      state: "cancelled",
      detailType: "GoodCity",
      code: "GC-00001"
    });
    item = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order5
    });
    item1 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order5
    });
    item2 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order6
    });
    item3 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order6
    });
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item,
      designation: order5
    });
    orders_package1 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item1,
      designation: order5
    });
    orders_package2 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item2,
      designation: order6
    });
    orders_package3 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item3,
      designation: order6
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
        designations: [
          order5.toJSON({ includeId: true }),
          order6.toJSON({ includeId: true })
        ],
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
        meta: { search: order5.get("code").toString() }
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
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Clicking on Cancel order changes orders state to cancelled", function(assert) {
  assert.expect(2);
  MockUtils.mock({
    url: "/api/v1/designations/*",
    type: "GET",
    status: 200,
    responseText: {
      designations: [order5.toJSON({ includeId: true })],
      orders_packages: [
        orders_package.toJSON({ includeId: true }),
        orders_package1.toJSON({ includeId: true })
      ]
    }
  });
  MockUtils.mock({
    url: "/api/v1/orders/" + order5.id + "/transitio*",
    type: "PUT",
    status: 200,
    responseText: {
      designations: [order6.toJSON({ includeId: true })],
      orders_packages: [
        orders_package2.toJSON({ includeId: true }),
        orders_package3.toJSON({ includeId: true })
      ]
    }
  });
  visit("/orders/" + order5.id + "/active_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
    click($("button.expand")[0]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
  });
});
