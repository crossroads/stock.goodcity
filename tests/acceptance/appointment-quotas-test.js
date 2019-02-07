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


let App, mocks, presets, slots, bookingType;
module("Acceptance: Appointment Quotas", {
  beforeEach: function() {
    App = startApp({}, 2);

    const makeTimestamp = (plusDays = 0) => {
      let d = new Date();
      d.setHours(14);
      d.setMinutes(30);
      d.setSeconds(0);
      d.setDate(d.getDate() + plusDays);
      return d;
    };

    mocks = [];

    const mockResource = (resourcePath, data) => {
      mocks.push(
        $.mockjax({
          url: `/api/v1/${resourcePath}`,
          responseText:  data
        })
      );
    };

    presets = _.range(1,8).map(day => FactoryGuy.make("appointment_slot_preset", { id: day, day }).toJSON({ includeId: true }));
    slots = _.range(1,4).map(n => FactoryGuy.make('appointment_slot', { id: n, timestamp: makeTimestamp(n), quota: 2 }).toJSON({ includeId: true }));
    bookingType = FactoryGuy.make("booking_type");
    $.mockjaxSettings.matchInRegistrationOrder = false;
    $.mockjax({url:"/api/v1/orders/summar*", responseText: {
      "submitted":14,
      "awaiting_dispatch":1,
      "dispatching":1,
      "processing":2,
      "priority_submitted":14,
      "priority_dispatching":1,
      "priority_processing":2,
      "priority_awaiting_dispatch":1
    }});

    mockResource('auth/current_user_profil*', userProfile);
    mockResource('designation*', { designations: [] });
    mockResource('location*', { locations: [] });
    mockResource('appointment_slot_preset*', { appointment_slots: presets });
    mockResource('appointment_slot*', { appointment_slots: slots });
    mockResource('booking_typ*', { booking_types: [bookingType.toJSON({includeId: true})] });

    visit("/");

    andThen(function() {
      visit("/appointments/");
    });
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

test("Quota settings page should be accessible from the menu list", function(assert) {
  assert.expect(1);

  visit("/app_menu_list/");

  andThen(() => {
    click(Ember.$(".appointments-link")[0]);
  });

  andThen(() => {
    assert.equal(
      currentURL(),
      `/appointments`,
      "Should be on the appointment settings page"
    );
  });
});

test("Preset tab is selected by default", function(assert) {
  assert.expect(1);
  assert.ok(Ember.$('.preset-tab').hasClass('selected'));
});

test('Preset tab has a section for each day of the week', function (assert) {
  assert.expect(8);

  const headers = Ember.$('.settings-section.presets .day-header .title').toArray().map(el => el.textContent);
  assert.equal(headers.length, 7);
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((dayName, idx) => {
    assert.equal(headers[idx], dayName);
  });
});

test('Presets can be added by clicking on the "Add timeslot" button', function (assert) {
  assert.expect(4);

  let postRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/appointment_slot_preset*",
      type: 'POST',
      status: 200,
      onAfterComplete: () => {
        postRequestSent = true;
      },
      response: (req) => {
        const data = JSON.parse(req.data);
        data.appointment_slot_preset.id = '555';
        return data;
      }
    })
  );

  const createBtn = Ember.$('.settings-section.presets a.new-preset-btn');
  assert.ok(createBtn);
  assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 7);

  click(createBtn);
  andThen(() => {
    assert.ok(postRequestSent);
  });
  andThen(() => {
    assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 8);
  });
});

test('Presets can be deleted by clicking on the cross button', function (assert) {
  assert.expect(4);
  let deleteRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/appointment_slot_preset*",
      type: 'DELETE',
      status: 200,
      onAfterComplete: () => deleteRequestSent = true,
      responseText: {}
    })
  );

  const deleteBtn = Ember.$('.settings-section.presets .delete-btn i');
  assert.ok(deleteBtn);
  assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 7);

  click(deleteBtn);
  andThen(() => {
    assert.ok(deleteRequestSent);
  });
  andThen(() => {
    assert.equal(Ember.$('.slot-bar.preset-timeslot').length, 6);
  });
});

test("Special tab is selected by clicking on it", function(assert) {
  assert.expect(4);
  assert.notOk(Ember.$('.special-tab').hasClass('selected'));
  assert.notOk(Ember.$('.settings-section.special-days').hasClass('show'));

  click(Ember.$('.special-tab a'));

  andThen(() => {
    assert.ok(Ember.$('.special-tab').hasClass('selected'));
    assert.ok(Ember.$('.settings-section.special-days').hasClass('show'));
  });
});

test('Special tab aggregates slots by date', function (assert) {
  assert.expect(1);

  const headers = Ember.$('.settings-section.special-days .day-header').toArray().map(el => el.textContent);
  assert.equal(headers.length, slots.length);
});

test('Special timeslots can be added by clicking on the "Add timeslot" button', function (assert) {
  assert.expect(4);

  let postRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/appointment_slot*",
      type: 'POST',
      status: 200,
      onAfterComplete: () => {
        postRequestSent = true;
      },
      response: (req) => {
        const data = JSON.parse(req.data);
        data.appointment_slot.id = '666';
        return data;
      }
    })
  );

  const createBtn = Ember.$('.settings-section.special-days a.new-timeslot-btn');
  assert.ok(createBtn);
  assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length);

  click(createBtn);
  andThen(() => {
    assert.ok(postRequestSent);
  });
  andThen(() => {
    assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length + 1);
  });
});

test('Special timeslots can be deleted by clicking on the cross button', function (assert) {
  assert.expect(4);
  let deleteRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/appointment_slot*",
      type: 'DELETE',
      status: 200,
      onAfterComplete: () => deleteRequestSent = true,
      responseText: {}
    })
  );

  const deleteBtn = Ember.$('.settings-section.special-days .delete-btn i');
  assert.ok(deleteBtn);
  assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length);

  click(deleteBtn);
  andThen(() => {
    assert.ok(deleteRequestSent);
  });
  andThen(() => {
    assert.equal(Ember.$('.slot-bar.special-day-timeslot').length, slots.length - 1);
  });
});

_.each({
  'Preset quotas can be increased': {
    btnSelector: '.settings-section.presets i.increase-quota',
    rowSelector: '.slot-bar.preset-timeslot',
    quotaDiff: 1,
    modelName: 'appointment_slot_preset',
    getRecords: () => presets
  },
  'Preset quotas can be decreased': {
    btnSelector: '.settings-section.presets i.decrease-quota',
    rowSelector: '.slot-bar.preset-timeslot',
    quotaDiff: -1,
    modelName: 'appointment_slot_preset',
    getRecords: () => presets
  },
  'Special timeslot quotas can be increased': {
    btnSelector: '.settings-section.special-days i.increase-quota',
    rowSelector: '.slot-bar.special-day-timeslot',
    quotaDiff: 1,
    modelName: 'appointment_slot',
    getRecords: () => slots
  },
  'Special timeslot quotas can be decreased': {
    btnSelector: '.settings-section.special-days i.decrease-quota',
    rowSelector: '.slot-bar.special-day-timeslot',
    quotaDiff: -1,
    modelName: 'appointment_slot',
    getRecords: () => slots
  }
}, (props, testName) => {
  const { btnSelector, quotaDiff, getRecords, modelName, rowSelector } = props;
  test(testName, function (assert) {
    assert.expect(5);
    let updateRequestSent = false;
    mocks.push(
      $.mockjax({
        url: `/api/v1/${modelName}*`,
        type: 'PUT',
        onAfterComplete: () => updateRequestSent = true,
        response: (req) => {
          const data = JSON.parse(req.data);
          console.log(data);
          assert.equal(data[modelName].quota, getRecords()[0].quota + quotaDiff);
          return data;
        }
      })
    );
    const actionBtn = Ember.$(btnSelector);
    assert.ok(actionBtn);
    assert.equal(Ember.$(rowSelector).length, getRecords().length);
    click(actionBtn);
    andThen(() => assert.ok(updateRequestSent));
    andThen(() => assert.equal(Ember.$(rowSelector).length, getRecords().length));
  });

});
