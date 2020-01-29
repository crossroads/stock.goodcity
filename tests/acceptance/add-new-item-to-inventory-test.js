import { run } from "@ember/runloop";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/item";
import "../factories/location";
import "../factories/designation";
import "../factories/code";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
import MockUtils from "../helpers/mock-utils";

var App, location1, location2, designation, code, bookingType, store;

module("Acceptance: Add item to inventory", {
  beforeEach: function() {
    App = startApp({}, 2);

    store = App.__container__.lookup("service:store");

    MockUtils.startSession();
    MockUtils.mockEmptyPreload();
    MockUtils.mockEmpty("order_transport");
    MockUtils.mockUserProfile();
    MockUtils.mockOrderSummary();
    MockUtils.mockDonorConditions();

    location1 = FactoryGuy.make("location");
    location2 = FactoryGuy.make("location");
    designation = FactoryGuy.make("designation");
    bookingType = FactoryGuy.make("booking_type");
    mockFindAll("designation").returns({
      json: { designations: [designation.toJSON({ includeId: true })] }
    });
    mockFindAll("location").returns({
      json: {
        locations: [location2.toJSON({ includeId: true })],
        meta: { search: location2.get("building").toString() }
      }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    code = FactoryGuy.make("code", { location: location1 });
    visit("/");
  },
  afterEach: function() {
    MockUtils.closeSession();
    run(App, "destroy");
  }
});

// test("Select custom location on create item screen instead of default location of package type", function(assert) {
//   assert.expect(5);
//   andThen(function() {
//     visit("/search_code");
//   });

//   $.mockjax({
//     url: "/api/v1/package_type*",
//     type: "GET",
//     status: 200,
//     responseText: {
//       codes: [code.toJSON({ includeId: true })]
//     }
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "search_code");
//     //fill search box with package_type name i.e code.name
//     fillIn("#searchText", code.get("name"));
//     //click on first package_type
//     click(find(".list li:first")[0]);
//     //generate inventory_number for new package
//     $.mockjax({
//       url: "/api/v1/inventory*",
//       type: "POST",
//       status: 200,
//       responseText: { inventory_number: "000311" }
//     });
//     //stub image request dummy values
//     $.mockjax({
//       url: "/api/v1/images/generate_sign*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         api_key: 123456789876543,
//         signature: "3ec17bf700bc23446d61932385d",
//         timestamp: 1234567891,
//         tags: "staging"
//       }
//     });

//     andThen(function() {
//       assert.equal(currentPath(), "items.new");
//       //redirects to page 'select_location' route to selecting new location.
//       click(find("#inventory_location")[0]);
//       andThen(function() {
//         assert.equal(currentPath(), "select_location");

//         fillIn("#searchText", location2.get("building"));

//         mockFindAll("location").returns({
//           json: {
//             locations: [location2.toJSON({ includeId: true })],
//             meta: { search: location2.get("building").toString() }
//           }
//         });
//         andThen(function() {
//           click(find(".list li:first")[0]);
//           andThen(function() {
//             assert.equal(currentPath(), "items.new");
//             assert.equal(
//               Ember.$("#inventory_location")
//                 .find("input")
//                 .val()
//                 .indexOf(location2.get("building")),
//               0
//             );
//           });
//         });
//       });
//     });
//   });
// });

// test("Check validation for 'Add item to inventory ' page''", function(assert) {
//   assert.expect(6);
//   andThen(function() {
//     visit("/");
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "index");
//     click($(".small-block-grid-4 li:last"));
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "app_menu_list");
//     click($(".inventory"));
//   });

//   andThen(function() {
//     visit("/search_code");
//   });

//   $.mockjax({
//     url: "/api/v1/package_type*",
//     type: "GET",
//     status: 200,
//     responseText: {
//       codes: [code.toJSON({ includeId: true })]
//     }
//   });
//   andThen(function() {
//     assert.equal(currentPath(), "search_code");
//     //fill search box with package_type name i.e code.name
//     fillIn("#searchText", code.get("name"));
//     //click on first package_type
//     click(find(".list li:first")[0]);
//     //generate inventory_number for new package
//     $.mockjax({
//       url: "/api/v1/inventory*",
//       type: "POST",
//       status: 200,
//       responseText: { inventory_number: "000311" }
//     });
//     //stub image request dummy values
//     $.mockjax({
//       url: "/api/v1/images/generate_sign*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         api_key: 123456789876543,
//         signature: "3ec17bf700bc23446d61932385d",
//         timestamp: 1234567891,
//         tags: "staging"
//       }
//     });
//     andThen(function() {
//       //after click on package_type redirect to new item creation page
//       assert.equal(currentPath(), "items.new");
//       //clear description by clicking clear button for validation
//       Ember.$(".remove-text").click();
//       //verify description is empty
//       assert.equal($("#description").val(), "");
//       //click submit button to trigger validation boxes
//       click(find(".button.expand:last"));
//       andThen(function() {
//         //check if description error box is 'visible'

//         assert.equal(
//           $("#description").siblings(".input-error")[0].innerHTML,
//           "Description cannot be blank."
//         );

//         //unable to click pop up message box buttons
//         // click($('.button.secondary.expand'));
//         // andThen(function() {
//         //   Ember.$('#messageBox #btn1')[0].click();
//         // });

//         // andThen(function() {
//         //   assert.equal(currentPath(), "/");
//         // });
//       });
//     });
//   });
// });

// test("Redirect to /search_code after clicking Add item to inventory and save redirects to items details page", function(assert) {
//   assert.expect(15);

//   $.mockjax({
//     url: "/api/v1/package_type*",
//     type: "GET",
//     status: 200,
//     responseText: {
//       codes: [code.toJSON({ includeId: true })]
//     }
//   });

//   andThen(function() {
//     visit("/");
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "index");
//     click($(".small-block-grid-4 li:last"));
//   });

//   andThen(function() {
//     assert.equal(currentPath(), "app_menu_list");
//     click($(".inventory"));
//   });
//   andThen(function() {
//     assert.equal(currentPath(), "search_code");
//     //fill search box with package_type name i.e code.name
//     fillIn("#searchText", code.get("name"));
//     //click on first package_type
//     click($(".list li:first")[0]);
//     //generate inventory_number for new package
//     $.mockjax({
//       url: "/api/v1/inventory*",
//       type: "POST",
//       status: 200,
//       responseText: { inventory_number: "000311" }
//     });
//     //stub image request dummy values
//     $.mockjax({
//       url: "/api/v1/images/generate_sign*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         api_key: 123456789876543,
//         signature: "3ec17bf700bc23446d61932385d",
//         timestamp: 1234567891,
//         tags: "staging"
//       }
//     });
//     andThen(function() {
//       //after click on package_type redirect to new item creation page
//       assert.equal(currentPath(), "items.new");

//       assert.equal($("#qty").val(), "1");
//       //verify package_type name
//       assert.equal(
//         $(".columns .left input")
//           .last()
//           .val(),
//         code.get("name")
//       );
//       //fill description
//       assert.equal($("#description").val(), code.get("name"));
//       assert.equal($("#height").val(), "");
//       assert.equal($("#width").val(), "");
//       assert.equal($("#length").val(), "");
//       //select grade
//       assert.equal($("label select").val(), "B");
//       //select condition
//       assert.equal(
//         $("#condition-select").val(),
//         store
//           .peekAll("donor_condition")
//           .filterBy("name", "Lightly Used")
//           .get("firstObject.id")
//       );
//       //check  #Donation input box
//       assert.equal(
//         $(".small-9.columns input")
//           .first()
//           .val(),
//         ""
//       );
//       //check location input box
//       assert.equal(
//         $(".small-9.columns input")
//           .last()
//           .val(),
//         location1.get("displayName")
//       );
//       // check inventory-number
//       assert.equal(
//         $(".inventory-number")
//           .text()
//           .match(/\d+/g)[0],
//         "000311"
//       );
//     });
//     // andThen(function() {
//     //     //click save button
//     //     click($('.button.expand').last());
//     //     //genrate new item data
//     //     var loc = FactoryGuy.make("location", { id: 7 });
//     //     var pkgLocation = FactoryGuy.make("packages_location", {id: 764, location: loc});
//     //     var pkg = FactoryGuy.make("item", { id: 971, quantity: 1,  notes: "Baby Crib, Set (frame, mattress)", inventoryNumber:"000317", "package_type_id":9, packageLocations: [ pkgLocation ]  });
//     //     var code1 = FactoryGuy.make("code", { id: 9, name: "Baby Crib, Set (frame, mattress)", code: "BBS", location: loc  });

//     //     $.mockjax({url:"/api/v1/package*", type: 'POST', status: 200,responseText:{
//     //       item : pkg.toJSON({includeId: true}),
//     //       code : [ code1.toJSON({includeId: true}) ],
//     //       locations: [ loc.toJSON({includeId: true}) ],
//     //       packages_locations:[pkgLocation.toJSON({includeId: true})]
//     //       }});

//     //     $.mockjax({url:"api/v1/stockit_items/*", type: 'GET', status: 200,responseText:{
//     //       item : pkg.toJSON({includeId: true}),
//     //       code : [ code1.toJSON({includeId: true}) ],
//     //       locations: [ loc.toJSON({includeId: true}) ],
//     //       packages_locations:[pkgLocation.toJSON({includeId: true})]
//     //     }});

//     //     andThen(function() {
//     //       assert.equal(currentPath(), "items.detail");
//     //     });
//     //   });
//   });
// });
