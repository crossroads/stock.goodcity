import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/location";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";

var App, pkg1, pkg2, order1, order2, orders_pkg1, orders_pkg2, orders_pkg3;

module("Acceptance: Partial undesignate/modify", {
  beforeEach: function() {
    App = startApp({}, 2);
    var location = FactoryGuy.make("location");
    var bookingType = FactoryGuy.make("booking_type");
    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    order1 = FactoryGuy.make("designation", { id: 100, state: "submitted" });
    order2 = FactoryGuy.make("designation", {
      id: 101,
      state: "awaiting_dispatch"
    });
    pkg1 = FactoryGuy.make("item", {
      id: 51,
      state: "submitted",
      designation: order1,
      quantity: 0
    });
    pkg2 = FactoryGuy.make("item", {
      id: 52,
      state: "submitted",
      quantity: 1,
      receivedQuantity: 1,
      designation: order2
    });
    orders_pkg1 = FactoryGuy.make("orders_package", {
      id: 500,
      state: "designated",
      quantity: 1,
      item: pkg1,
      designationId: order1.id,
      designation: order1
    });
    orders_pkg2 = FactoryGuy.make("orders_package", {
      id: 501,
      state: "dispatched",
      quantity: 1,
      item: pkg1,
      designationId: order1.id,
      designation: order1,
      sent_on: Date.now()
    });
    orders_pkg3 = FactoryGuy.make("orders_package", {
      id: 502,
      state: "designated",
      quantity: 1,
      item: pkg2,
      designationId: order2.id,
      designation: order2
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
  },
  afterEach: function() {
    Ember.run(App, "destroy");
  }
});

// test("BackLink redirects to Item's detail if previous route was Item's detail", function(assert) {
//   assert.expect(1);
//   $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
//       items: [pkg2.toJSON({includeId: true})]
//     }
//   });
//   mockFindAll('designation').returns({json: {designations: [order1.toJSON({includeId: true})], orders_packages: [orders_pkg1.toJSON({includeId: true})], items: [pkg2.toJSON({includeId: true})]}});
//   //visiting Item's detail
//   visit("/items/" + pkg2.id);

//   //clicking on status bar
//   andThen(function() {
//     click(find('.fa-shopping-basket'));
//   });

//   //clicking on back link icon
//   andThen(function() {
//     click(find('.back_text'));
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "items.detail");
//   });
// });

// test("BackLink redirects to Item's index(search) if previous route was Item's index", function(assert) {
//   assert.expect(1);
//   mockFindAll('item').returns({ json: {items: [pkg1.toJSON({includeId: true})], orders_packages: [orders_pkg1.toJSON({includeId: true})], designations:[order1.toJSON({includeId: true})], meta: {search: pkg1.get('inventoryNumber').toString()}}});
//   mockFindAll('designation').returns({json: {designations: [order1.toJSON({includeId: true})], orders_packages: [orders_pkg1.toJSON({includeId: true})], items: [pkg1.toJSON({includeId: true})]}});
//   $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
//       items: [pkg1.toJSON({includeId: true})],
//       orders_packages: [orders_pkg1.toJSON({includeId: true})],
//       designations: [order1.toJSON({includeId: true})]
//     }
//   });

//   //Visiting Item's index
//   visit("/items");

//   //Searching for Item using Inventory Number
//   andThen(function() {
//     fillIn("#searchText", pkg1.get("inventoryNumber"));
//   });

//   //clicking on order code
//   andThen(function() {
//     click($('.dispatch_details div:first span'));
//   });

//   //Clicking on BackLink
//   andThen(function() {
//     click(find('.back-text'));
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "items.index");
//   });
// });

test("Available actions for designated OrdersPackages are modify and dispatch", function(assert) {
  assert.expect(2);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  visit("/items/" + pkg1.id + "/partial_undesignate");
  //Modify Action available
  andThen(function() {
    assert.equal(find(".modify-text").text(), "Modify");
  });

  //Dispatch Action available
  andThen(function() {
    assert.equal(find(".dispatch-text").text(), "Dispatch");
  });
});

test("Available action for dispatched OrdersPackages is Undispatch", function(assert) {
  assert.expect(1);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg2.toJSON({ includeId: true })]
    }
  });

  visit("/items/" + pkg1.id + "/partial_undesignate");

  //Undispatch Action available
  andThen(function() {
    assert.equal(
      find(".undispatch-packages")
        .text()
        .trim(),
      "Undispatch"
    );
  });
});

test("Designated and Dispatched OrdersPackages have respective background colors", function(assert) {
  assert.expect(2);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [
        orders_pkg1.toJSON({ includeId: true }),
        orders_pkg2.toJSON({ includeId: true })
      ]
    }
  });

  visit("/items/" + pkg1.id + "/partial_undesignate");

  andThen(function() {
    //designated OrdersPackage
    assert.equal($(".light-theme").css("background-color"), "rgb(51, 79, 117)");
    //dispatched OrdersPackage
    assert.equal($(".dark-theme").css("background-color"), "rgb(0, 28, 66)");
  });
});

test("Clicking on cancel designation of Item cancels designation", function(assert) {
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/orders_packages*",
    type: "GET",
    status: 200,
    responseText: {
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/item*",
    type: "PUT",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  //visiting Item's partial undesignate
  visit("/items/" + pkg1.id + "/partial_undesignate");

  //Clicking on modify
  andThen(function() {
    click(find(".modify-text"));
  });

  //Clicking on cancel designation link
  andThen(function() {
    click(find(".cancel-designation"));
  });

  //Clicking on okay button of messagebox
  andThen(function() {
    click(find("#messageBox #btn1"));
  });

  //Redirected back to partial undesignate page
  andThen(function() {
    assert.equal(currentPath(), "items.partial_undesignate");
  });
});

test("Cancel designation of OrdersPackage by modifying quantity", function(assert) {
  assert.expect(1);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/orders_packages*",
    type: "GET",
    status: 200,
    responseText: {
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/item*",
    type: "PUT",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  //visiting Item's partial undesignate
  visit("/items/" + pkg1.id + "/partial_undesignate");

  //Clicking on modify
  andThen(function() {
    click(find(".modify-text"));
  });

  //Filling text field with 0 qty and pressing okay
  andThen(function() {
    fillIn(".partial_undesignate_textfield input", 0);
    click("#undesignateButton");
  });

  //Redirected back to partial undesignate page
  andThen(function() {
    assert.equal(currentPath(), "items.partial_undesignate");
  });
});

test("Dispatching designated OrdersPackage", function(assert) {
  assert.expect(1);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg2.toJSON({ includeId: true })],
      orders_packages: [orders_pkg3.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/item*",
    type: "PUT",
    status: 200,
    responseText: {
      items: [pkg2.toJSON({ includeId: true })],
      orders_packages: [orders_pkg3.toJSON({ includeId: true })]
    }
  });

  //visiting Item's partial undesignate
  visit("/items/" + pkg2.id + "/partial_undesignate");
  //Clicking on dispatch
  andThen(function() {
    click(find(".dispatch-text"));
  });

  //Clicking on dispatch on dispatch page
  andThen(function() {
    click(find("#partial_dispatch")[0]);
  });

  //Redirects back to item's detail page
  andThen(function() {
    assert.equal(currentPath(), "items.detail.info");
  });
});

test("Should not dispatch designated items if not order not processed", function(assert) {
  assert.expect(1);
  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [
        pkg1.toJSON({
          includeId: true
        })
      ],
      orders_packages: [
        orders_pkg2.toJSON({
          includeId: true
        })
      ]
    }
  });

  $.mockjax({
    url: "/api/v1/item*",
    type: "PUT",
    status: 200,
    responseText: {
      items: [
        pkg1.toJSON({
          includeId: true
        })
      ],
      orders_packages: [
        orders_pkg2.toJSON({
          includeId: true
        })
      ]
    }
  });

  //visiting Item's partial undesignate
  visit("/items/" + pkg1.id + "/partial_undesignate");
  //Clicking on dispatch
  andThen(function() {
    click(find(".dispatch-text"));
  });

  //Clicking on dispatch on dispatch page
  andThen(function() {
    assert.equal(currentPath(), "items.partial_undesignate");
  });
});

test("Undispatching dispatched OrdersPackage", function(assert) {
  assert.expect(1);

  var location = FactoryGuy.make("location");
  mockFindAll("location").returns({
    json: { locations: [location.toJSON({ includeId: true })] }
  });

  $.mockjax({
    url: "/api/v1/stockit_item*",
    type: "GET",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  $.mockjax({
    url: "/api/v1/item*",
    type: "PUT",
    status: 200,
    responseText: {
      items: [pkg1.toJSON({ includeId: true })],
      orders_packages: [orders_pkg1.toJSON({ includeId: true })]
    }
  });

  //visiting Item's partial undesignate
  visit("/items/" + pkg1.id + "/partial_undesignate");

  //Clicking on Undispatch
  andThen(function() {
    click(find(".undispatch-text"));
  });

  //Clicking on first location on recently used location list
  andThen(function() {
    click(".building_name");
  });

  //Clicking Move on messageBox
  andThen(function() {
    click(find("#messageBox #btn1"));
  });

  //Redirected back to Item's detail
  andThen(function() {
    assert.equal(currentPath(), "items.detail.info");
  });
});
