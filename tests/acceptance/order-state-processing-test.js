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
  designation1,
  designation2,
  item,
  item1,
  orders_package,
  orders_package1,
  orders_package2,
  orders_package3,
  item2,
  item3;

module("Acceptance: Order State processing", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockDefault();

    designation1 = FactoryGuy.make("designation", {
      state: "submitted",
      detailType: "GoodCity",
      code: "GC-00002"
    });
    designation2 = FactoryGuy.make("designation", {
      state: "processing",
      detailType: "GoodCity",
      code: "GC-00002"
    });
    var location = FactoryGuy.make("location");
    var bookingType = FactoryGuy.make("booking_type");
    item = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: designation1
    });
    item1 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: designation1
    });
    item2 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: designation2
    });
    item3 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 1,
      designation: designation2
    });
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item,
      designation: designation1
    });
    orders_package1 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item1,
      designation: designation1
    });
    orders_package2 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item2,
      designation: designation2
    });
    orders_package3 = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 1,
      item: item3,
      designation: designation2
    });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    mockFindAll("designation").returns({
      json: {
        designations: [
          designation1.toJSON({ includeId: true }),
          designation2.toJSON({ includeId: true })
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
        meta: { search: designation1.get("code").toString() }
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

test("Clicking on Start processing changes orders state to processing", function(assert) {
  assert.expect(2);
  MockUtils.mock({
    url: "/api/v1/designations/*",
    type: "GET",
    status: 200,
    responseText: {
      designations: [designation1.toJSON({ includeId: true })],
      orders_packages: [
        orders_package.toJSON({ includeId: true }),
        orders_package1.toJSON({ includeId: true })
      ]
    }
  });
  MockUtils.mock({
    url: "/api/v1/orders/" + designation1.id + "/transitio*",
    type: "PUT",
    status: 200,
    responseText: {
      designations: [designation2.toJSON({ includeId: true })],
      orders_packages: [
        orders_package2.toJSON({ includeId: true }),
        orders_package3.toJSON({ includeId: true })
      ]
    }
  });
  visit("/orders/" + designation1.id + "/active_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
    click($("button.expand")[0]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
  });
});
