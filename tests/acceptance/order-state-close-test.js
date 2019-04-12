import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/location";
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
  item3,
  purpose,
  process_checklist;

module("Acceptance: Order State closed", {
  beforeEach: function() {
    App = startApp({}, 2);
    purpose = FactoryGuy.make("purpose", { nameEn: "Organisation" });
    process_checklist = FactoryGuy.make("process_checklist", {
      nameEn: "Organisation"
    });
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
    var location = FactoryGuy.make("location");
    var bookingType = FactoryGuy.make("booking_type");
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
    var data = {
      user_profile: [
        {
          id: 2,
          first_name: "David",
          last_name: "Dara51",
          mobile: "61111111",
          user_role_ids: [1]
        }
      ],
      users: [
        { id: 2, first_name: "David", last_name: "Dara51", mobile: "61111111" }
      ],
      roles: [{ id: 4, name: "Supervisor" }],
      user_roles: [{ id: 1, user_id: 2, role_id: 4 }]
    };

    $.mockjax({ url: "/api/v1/auth/current_user_profil*", responseText: data });

    $.mockjax({
      url: "/api/v1/orders/*",
      type: "GET",
      status: 200,
      responseText: {
        meta: {
          counts: { cancelled: 21, dispatching: 34, submitted: 23, closed: 6 }
        },
        designation: [order3.toJSON({ includeId: true })][0],
        items: [item.toJSON({ includeId: true })],
        purposes: [purpose.toJSON({ includeId: true })]
      }
    });

    $.mockjax({
      url: "/api/v1/orders/summar*",
      responseText: {
        submitted: 14,
        awaiting_dispatch: 1,
        dispatching: 1,
        processing: 2,
        priority_submitted: 14,
        priority_dispatching: 1,
        priority_processing: 2,
        priority_awaiting_dispatch: 1
      }
    });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
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
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    mockFindAll("process_checklist").returns({
      json: {
        process_checklists: [process_checklist.toJSON({ includeId: true })]
      }
    });
    mockFindAll("purpose").returns({
      json: { purposes: [purpose.toJSON({ includeId: true })] }
    });
  },
  afterEach: function() {
    Ember.run(App, "destroy");
  }
});

test("Clicking on Start dispatching changes orders state to dispatching", function(assert) {
  assert.expect(2);
  $.mockjax({
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
  $.mockjax({
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
