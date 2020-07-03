// import Ember from "ember";
// import { module, test } from "qunit";
// import startApp from "../helpers/start-app";
// import "../factories/orders_package";
// import "../factories/designation";
// import "../factories/item";
// import "../factories/location";
// import FactoryGuy from "ember-data-factory-guy";
// import { mockFindAll } from "ember-data-factory-guy";

// var App, pkg, mocks;

// module("Acceptance: Split Item Quantity", {
//   beforeEach: function() {
//     App = startApp({}, 2);
//     var location = FactoryGuy.make("location");
//     var designation = FactoryGuy.make("designation");
//     var bookingType = FactoryGuy.make("booking_type");
//     mockFindAll("designation").returns({
//       json: { designations: [designation.toJSON({ includeId: true })] }
//     });
//     mockFindAll("location").returns({
//       json: { locations: [location.toJSON({ includeId: true })] }
//     });
//     mockFindAll("booking_type").returns({
//       json: { booking_types: [bookingType.toJSON({ includeId: true })] }
//     });
//     pkg = FactoryGuy.make("item", {
//       id: 50,
//       state: "submitted",
//       quantity: 20,
//       height: 10,
//       width: 15,
//       length: 20,
//       notes: "Split quantity test."
//     });
//     var data = {
//       user_profile: [
//         {
//           id: 2,
//           first_name: "David",
//           last_name: "Dara51",
//           mobile: "61111111",
//           user_role_ids: [1]
//         }
//       ],
//       users: [
//         { id: 2, first_name: "David", last_name: "Dara51", mobile: "61111111" }
//       ],
//       roles: [{ id: 4, name: "Supervisor" }],
//       user_roles: [{ id: 1, user_id: 2, role_id: 4 }]
//     };

//     mocks = [];
//     $.mockjaxSettings.matchInRegistrationOrder = false;
//     mocks.push(
//       $.mockjax({
//         url: "/api/v1/auth/current_user_profile*",
//         responseText: data
//       }),
//       $.mockjax({
//         url: "/api/v1/orders/summary*",
//         responseText: {
//           submitted: 14,
//           awaiting_dispatch: 1,
//           dispatching: 1,
//           processing: 2,
//           priority_submitted: 14,
//           priority_dispatching: 1,
//           priority_processing: 2,
//           priority_awaiting_dispatch: 1
//         }
//       })
//     );
//   },
//   afterEach: function() {
//     // Clear our ajax mocks
//     $.mockjaxSettings.matchInRegistrationOrder = true;
//     mocks.forEach($.mockjax.clear);

//     // Stop the app
//     Ember.run(App, "destroy");
//   }
// });

// test("Splitting the Quantity of item", function(assert) {
//   assert.expect(1);
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 18,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}/publishing`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     fillIn("#qtySplitter", "2");
//   });
//   andThen(function() {
//     click(".split-item-btn");
//   });
//   andThen(function() {
//     assert.equal($(".inventory-holder").text(), 18);
//   });
// });

// test("Testing upper limit validation for splitting the quantity", function(assert) {
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 2,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   assert.expect(1);
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     click(".increment-btn-icon");
//   });
//   andThen(function() {
//     assert.equal(
//       Ember.$(".error-box")
//         .text()
//         .trim(),
//       "Quantity to split must be at least 1 and less than 2"
//     );
//   });
// });

// test("Testing lower limit validation for splitting the quantity", function(assert) {
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 2,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   assert.expect(1);
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     click(".decrement-btn-icon");
//   });
//   andThen(function() {
//     assert.equal(
//       Ember.$(".error-box")
//         .text()
//         .trim(),
//       "Quantity to split must be at least 1 and less than 2"
//     );
//   });
// });

// test("Splitting the Quantity of item, entering wrong quantity(higher than the quantity) should show an error", function(assert) {
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 2,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   assert.expect(1);
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     fillIn("#qtySplitter", "4");
//   });
//   andThen(function() {
//     click(".split-item-btn");
//   });
//   andThen(function() {
//     assert.equal(
//       Ember.$(".error-box")
//         .text()
//         .trim(),
//       "Quantity to split must be at least 1 and less than 2"
//     );
//   });
// });

// test("Splitting the Quantity of item, entering wrong quantity(lower than the quantity) should show an error", function(assert) {
//   assert.expect(1);
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 2,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     fillIn("#qtySplitter", "0");
//   });
//   andThen(function() {
//     click(".split-item-btn");
//   });
//   andThen(function() {
//     assert.equal(
//       Ember.$(".error-box")
//         .text()
//         .trim(),
//       "Quantity to split must be at least 1 and less than 2"
//     );
//   });
// });

// test("Clicking on not now should not split, and quantity should remain as it is", function(assert) {
//   assert.expect(1);
//   const updatedPkg = FactoryGuy.make("item", {
//     id: 50,
//     state: "submitted",
//     availableQuantity: 20,
//     height: 10,
//     width: 15,
//     length: 20,
//     notes: "Update Package."
//   });
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/stockit_item*",
//       type: "GET",
//       status: 200,
//       responseText: {
//         items: [updatedPkg.toJSON({ includeId: true })]
//       }
//     })
//   );
//   mockFindAll("item").returns({
//     json: { items: [updatedPkg.toJSON({ includeId: true })] }
//   });
//   mocks.push(
//     $.mockjax({
//       url: `/items/${updatedPkg.id}/split_item*`,
//       type: "PUT",
//       status: 200,
//       responseText: updatedPkg
//     })
//   );
//   visit("/");
//   andThen(function() {
//     visit(`/items/${updatedPkg.id}/publishing`);
//   });
//   andThen(function() {
//     click(".small-block-grid-4 li:last");
//   });
//   andThen(function() {
//     click(".split-quantity");
//   });
//   andThen(function() {
//     fillIn("#qtySplitter", "2");
//   });
//   andThen(function() {
//     click(".dont-split-btn");
//   });
//   andThen(function() {
//     assert.equal($(".inventory-holder").text(), 20);
//   });
// });