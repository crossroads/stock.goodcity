import { run } from "@ember/runloop";
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
  order3,
  order4,
  item,
  item1,
  orders_package,
  orders_package1,
  orders_package2,
  orders_package3,
  item2,
  item3;

module("Acceptance: Order State closed", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();

    order3 = FactoryGuy.make("designation", {
      state: "dispatching",
      detailType: "GoodCity",
      code: "GC-00001"
    });
    order4 = FactoryGuy.make("designation", {
      state: "closed",
      detailType: "GoodCity",
      code: "GC-00001"
    });
    item = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order3
    });
    item1 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order3
    });
    item2 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order4
    });
    item3 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: order4
    });
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item,
      designation: order3
    });
    orders_package1 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item1,
      designation: order3
    });
    orders_package2 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item2,
      designation: order4
    });
    orders_package3 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item3,
      designation: order4
    });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    mockFindAll("designation").returns({
      json: {
        designations: [
          order3.toJSON({ includeId: true }),
          order4.toJSON({ includeId: true })
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
        meta: { search: order3.get("code").toString() }
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
    run(App, "destroy");
  }
});

test("Clicking on Start dispatching changes orders state to dispatching", function(assert) {
  assert.expect(2);
  MockUtils.mock({
    url: "/api/v1/designations/*",
    type: "GET",
    status: 200,
    responseText: {
      designations: [order3.toJSON({ includeId: true })],
      orders_packages: [
        orders_package.toJSON({ includeId: true }),
        orders_package1.toJSON({ includeId: true })
      ]
    }
  });
  MockUtils.mock({
    url: "/api/v1/orders/" + order3.id + "/transitio*",
    type: "PUT",
    status: 200,
    responseText: {
      designations: [order4.toJSON({ includeId: true })],
      orders_packages: [
        orders_package2.toJSON({ includeId: true }),
        orders_package3.toJSON({ includeId: true })
      ]
    }
  });
  visit("/orders/" + order3.id + "/active_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
    click($("button.expand")[0]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
  });
});
