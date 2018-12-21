import Ember from "ember";
import _ from "lodash";
import { module, test } from "qunit";
import FactoryGuy from "ember-data-factory-guy";
import startApp from "../helpers/start-app";
import "../factories/appointment_slot";
import "../factories/appointment_slot_preset";
import "../factories/user";

const userProfile = {
  user_profile: [{
    id: 2,
    first_name: "David",
    last_name: "Dara51",
    mobile: "61111111",
    user_role_ids: [1]
  }],
  users: [
    { id: 2, first_name: "David", last_name: "Dara51", mobile: "61111111" }
  ],
  permissions:[{id: 43, name: "can_manage_settings"}],
  role_permissions: [{id: 161, role_id: 4, permission_id: 43}],
  roles: [{ id: 4, name: "Supervisor" }],
  user_roles: [{ id: 1, user_id: 2, role_id: 4 }]
};


let App, mocks, designationAppointment, designationOnlineOrder;

const BOOKING_TYPES = { 
  appointment: { id: 1, identifier: 'appointment' },
  onlineOrder: { id: 2, identifier: 'online-order' }
};

module("Acceptance: Order details, appointment info", {
  beforeEach: function() {
    App = startApp({}, 2);
    
    mocks = [];

    const designations = [];
    const orderTransports = [];

    const makeDesignation = (bookingType = BOOKING_TYPES.onlineOrder) => {
      const record = FactoryGuy.make("designation", { 
        state: "submitted", 
        detailType: "GoodCity", 
        id: 1103 + designations.length 
      }).toJSON({includeId: true});

      orderTransports.push({ 
        id: _.uniqueId(), 
        designation_id: record.id, 
        order_id: record.id, 
        booking_type_id: bookingType.id,
        transport_type: 'self'
      });
      designations.push(record);
      return record;
    };

    designationAppointment = makeDesignation(BOOKING_TYPES.appointment);
    designationOnlineOrder = makeDesignation(BOOKING_TYPES.onlineOrder);

    const mockResource = (resourcePath, data) => {
      mocks.push(
        $.mockjax({
          url: `/api/v1/${resourcePath}`,
          responseText:  data
        })
      );
    };

    $.mockjaxSettings.matchInRegistrationOrder = false;

    mockResource('auth/current_user_profil*', userProfile);
    mockResource('booking_type*', { booking_types: _.values(BOOKING_TYPES) });
    mockResource('designation*', { 
      designations: designations,
      order_transports: orderTransports,
      booking_types: _.values(BOOKING_TYPES)
    });
    mockResource('orders_package*', { orders_packages: [] });
    mockResource('location*', { locations: [] });
    visit("/");
  },
  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    // Stop the app
    Ember.run(App, 'destroy');
  }
});

// ------ Tests

test("Tab's label should be 'appointment' if the order is a warehouse visit", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationAppointment.id}/order_types/`);

  andThen(function () {
    assert.equal($('.tab_row dd.small-3:nth-child(3)').text().trim().toLowerCase(), 'appointment');
  });
});

test("Tab's label should be 'Collection' if the order is an online order", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function () {
    assert.equal($('.tab_row dd.small-3:nth-child(3)').text().trim().toLowerCase(), 'collection');
  });
});

test("An order's schedule can be updated", function (assert) {
  assert.expect(3);

  let putRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/order_transport*",
      type: 'PUT',
      status: 200,
      onAfterComplete: () => {
        putRequestSent = true;
      },
      response: (req) => {
        return JSON.parse(req.data);
      }
    })
  );

  visit(`/orders/${designationAppointment.id}/order_types/`);

  andThen(() => {
    const rescheduleBtn = Ember.$('.order-booking-tab .reschedule.button');
    assert.equal(rescheduleBtn.length, 1);
    click(rescheduleBtn);
  });

  andThen(() => {
    const updateBtn = Ember.$('.order-booking-tab .reveal-modal  #btn1');
    assert.equal(updateBtn.length, 1);
    click(updateBtn);
  });

  andThen(() => {
    assert.ok(putRequestSent);
  });
});

// test('Timeslots can only be selected from 7am to 6:30pm', function (assert) {
//   assert.expect(3);

//   const options = $(".timeslots select").first().find('option');
//   assert.equal(options.length, 24);
//   assert.equal(options.first().text().trim(), "07:00");
//   assert.equal(options.last().text().trim(), "18:30");
// });

// test('Presets can be deleted by clicking on the cross button', function (assert) {
//   assert.expect(4);
//   let deleteRequestSent = false;
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/appointment_slot_preset*",
//       type: 'DELETE',
//       status: 200,
//       onAfterComplete: () => deleteRequestSent = true,
//       responseText: {}
//     })
//   );

//   const deleteBtn = Ember.$('.settings-section.presets .delete-btn i');
//   assert.ok(deleteBtn);
//   assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 7);

//   click(deleteBtn);
//   andThen(() => {
//     assert.ok(deleteRequestSent);
//   });
//   andThen(() => {
//     assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 6);
//   });
// });

// test("Special tab is selected by clicking on it", function(assert) {
//   assert.expect(4);
//   assert.notOk(Ember.$('.special-tab').hasClass('selected'));
//   assert.notOk(Ember.$('.settings-section.special-days').hasClass('show'));
  
//   click(Ember.$('.special-tab a'));

//   andThen(() => {
//     assert.ok(Ember.$('.special-tab').hasClass('selected'));
//     assert.ok(Ember.$('.settings-section.special-days').hasClass('show'));
//   });
// });

// test('Special tab aggregates slots by date', function (assert) {
//   assert.expect(1);

//   const headers = Ember.$('.settings-section.special-days .day-header').toArray().map(el => el.textContent);
//   assert.equal(headers.length, slots.length);
// });

// test('Special timeslots can be added by clicking on the "Add timeslot" button', function (assert) {
//   assert.expect(4);

//   let postRequestSent = false;
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/appointment_slot*",
//       type: 'POST',
//       status: 200,
//       onAfterComplete: () => {
//         postRequestSent = true;
//       },
//       response: (req) => {
//         const data = JSON.parse(req.data);
//         data.appointment_slot.id = '666';
//         return data;
//       }
//     })
//   );

//   const createBtn = Ember.$('.settings-section.special-days a.new-timeslot-btn');
//   assert.ok(createBtn);
//   assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length);

//   click(createBtn);
//   andThen(() => {
//     assert.ok(postRequestSent);
//   });
//   andThen(() => {
//     assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length + 1);
//   });
// });

// test('Special timeslots can be deleted by clicking on the cross button', function (assert) {
//   assert.expect(4);
//   let deleteRequestSent = false;
//   mocks.push(
//     $.mockjax({
//       url: "/api/v1/appointment_slot*",
//       type: 'DELETE',
//       status: 200,
//       onAfterComplete: () => deleteRequestSent = true,
//       responseText: {}
//     })
//   );

//   const deleteBtn = Ember.$('.settings-section.special-days .delete-btn i');
//   assert.ok(deleteBtn);
//   assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length);

//   click(deleteBtn);
//   andThen(() => {
//     assert.ok(deleteRequestSent);
//   });
//   andThen(() => {
//     assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length - 1);
//   });
// });

// _.each({
//   'Preset quotas can be increased': {
//     btnSelector: '.settings-section.presets .fa-plus-circle.increase-quota',
//     rowSelector: '.slot-bar.preset-timeslot',
//     quotaDiff: 1,
//     modelName: 'appointment_slot_preset',
//     getRecords: () => presets
//   },
//   'Preset quotas can be decreased': {
//     btnSelector: '.settings-section.presets .fa-minus-circle.decrease-quota',
//     rowSelector: '.slot-bar.preset-timeslot',
//     quotaDiff: -1,
//     modelName: 'appointment_slot_preset',
//     getRecords: () => presets
//   },
//   'Special timeslot quotas can be increased': {
//     btnSelector: '.settings-section.special-days .fa-plus-circle.increase-quota',
//     rowSelector: '.slot-bar.special-day-timeslot',
//     quotaDiff: 1,
//     modelName: 'appointment_slot',
//     getRecords: () => slots
//   },
//   'Special timeslot quotas can be decreased': {
//     btnSelector: '.settings-section.special-days .fa-minus-circle.decrease-quota',
//     rowSelector: '.slot-bar.special-day-timeslot',
//     quotaDiff: -1,
//     modelName: 'appointment_slot',
//     getRecords: () => slots
//   }
// }, (props, testName) => {
//   const { btnSelector, quotaDiff, getRecords, modelName, rowSelector } = props;
//   test(testName, function (assert) {
//     assert.expect(5);
//     let updateRequestSent = false;
//     mocks.push(
//       $.mockjax({
//         url: `/api/v1/${modelName}*`,
//         type: 'PUT',
//         onAfterComplete: () => updateRequestSent = true,
//         response: (req) => {
//           const data = JSON.parse(req.data);
//           console.log(data);
//           assert.equal(data[modelName].quota, getRecords()[0].quota + quotaDiff);
//           return data;
//         }
//       })
//     );
//     const actionBtn = Ember.$(btnSelector);
//     assert.ok(actionBtn);
//     assert.equal(Ember.$(rowSelector).length, getRecords().length);
//     click(actionBtn);
//     andThen(() => assert.ok(updateRequestSent));
//     andThen(() => assert.equal(Ember.$(rowSelector).length, getRecords().length));
//   });

// });
