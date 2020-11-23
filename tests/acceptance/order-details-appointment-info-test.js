import Ember from "ember";
import _ from "lodash";
import FactoryGuy, { mockFindAll } from "ember-data-factory-guy";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/appointment_slot";
import "../factories/appointment_slot_preset";
import "../factories/user";

const userProfile = {
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
  permissions: [{ id: 43, name: "can_manage_settings" }],
  role_permissions: [{ id: 161, role_id: 4, permission_id: 43 }],
  roles: [{ id: 4, name: "Supervisor" }],
  user_roles: [{ id: 1, user_id: 2, role_id: 4 }]
};

let App, mocks, designationAppointment, designationOnlineOrder;

const BOOKING_TYPES = {
  appointment: { id: 1, identifier: "appointment" },
  onlineOrder: { id: 2, identifier: "online-order" }
};

const PROCESS_CHECKLIST = [
  { id: 1, text: "task1", booking_type_id: 1 },
  { id: 2, text: "task2", booking_type_id: 1 },
  { id: 3, text: "task1", booking_type_id: 2 },
  { id: 4, text: "task2", booking_type_id: 2 }
];

module("Acceptance: Order details, logistics info", {
  beforeEach: function() {
    App = startApp({}, 2);

    mocks = [];

    const designations = [];
    const orderTransports = [];
    const ggvTransports = [{ id: 1, name: "Van" }];
    const districts = [{ id: 1, name: "The peak", territory_id: 1 }];
    const makeDesignation = (bookingType = BOOKING_TYPES.onlineOrder) => {
      const record = {
        state: "submitted",
        detail_type: "GoodCity",
        id: 1103 + designations.length,
        district_id: 1
      };

      record.booking_type_id = bookingType.id;

      orderTransports.push({
        id: _.uniqueId(),
        designation_id: record.id,
        order_id: record.id,
        transport_type: "self",
        gogovan_transport_id: 1,
        scheduled_at: "2019-02-14T11:00:00+08:00"
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
          responseText: data
        })
      );
    };

    $.mockjaxSettings.matchInRegistrationOrder = false;
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
    const cancellation_reason = _(3).times(() =>
      FactoryGuy.make("cancellation_reason").toJSON({ includeId: true })
    );

    mockFindAll("cancellation_reason").returns({
      json: {
        cancellation_reason: cancellation_reason
      }
    });

    mockFindAll("process_checklist").returns({
      json: {
        process_checklists: PROCESS_CHECKLIST
      }
    });

    mockResource("auth/current_user_profil*", userProfile);
    mockResource("booking_type*", { booking_types: _.values(BOOKING_TYPES) });
    mockResource("district*", { districts });
    mockResource("purpose*", { purposes: [] });

    mockResource("orders_process_checklist*", {
      orders_process_checklists: []
    });

    mockResource("gogovan_transport*", { gogovan_transports: ggvTransports });
    mockResource("designation*", {
      designations: designations,
      order_transports: orderTransports,
      booking_types: _.values(BOOKING_TYPES),
      gogovan_transports: ggvTransports,
      districts: districts
    });
    mockResource("orders_package*", { orders_packages: [] });
    mockResource("location*", { locations: [] });
    visit("/");
  },
  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    // Stop the app
    Ember.run(App, "destroy");
  }
});

// ------ Tests

test("Should display the process checklist items associated to that booking type", function(assert) {
  assert.expect(3);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function() {
    assert.equal($(".order-booking-tab .checklist-section .row").length, 2);
    assert.equal(
      $(".order-booking-tab .checklist-section .row:first-child .text")
        .text()
        .trim(),
      "task1"
    );
    assert.equal(
      $(".order-booking-tab .checklist-section .row:nth-child(2) .text")
        .text()
        .trim(),
      "task2"
    );
  });

  andThen(function() {
    test("Clicking on a checkbox should update the order", function(assert) {
      assert.expect(5);
      let putRequestSent = false;
      mocks.push(
        $.mockjax({
          url: "/api/v1/order*",
          type: "PUT",
          status: 200,
          onAfterComplete: () => {
            putRequestSent = true;
          },
          response: function(req) {
            let payload = req.data["order"];
            assert.ok(payload);
            assert.ok(payload["orders_process_checklists_attributes"]);
            assert.equal(
              payload["orders_process_checklists_attributes"].length,
              1
            );
            assert.equal(
              payload["orders_process_checklists_attributes"][0]["order_id"],
              designationOnlineOrder.id
            );
            this.responseText = JSON.stringify({
              designation: designationOnlineOrder
            });
          }
        })
      );

      visit(`/orders/${designationOnlineOrder.id}/order_types/`);

      andThen(function() {
        click(
          $(".order-booking-tab .checklist-section .row:first-child .checkbox")
        );
      });
      andThen(function() {
        assert.equal(putRequestSent, true);
      });
    });
  });
});

test("Should display the vehicle type", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function() {
    assert.equal(
      $(".order-booking-tab .vehicle option:selected")
        .text()
        .trim(),
      "Van"
    );
  });
});

test("Should display the district", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function() {
    assert.equal(
      $(".order-booking-tab .district option:selected")
        .text()
        .trim(),
      "The peak"
    );
  });
});

test("Should display the schedule", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function() {
    assert.equal(
      $(".order-booking-tab .reschedule")
        .text()
        .trim(),
      "Thursday 14th February 11:00 am"
    );
  });
});

test("Should display the type for an online order", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationOnlineOrder.id}/order_types/`);

  andThen(function() {
    assert.equal(
      $(".order-booking-tab .type option:selected")
        .text()
        .trim(),
      "Online Order"
    );
  });
});

test("Should display the type for an appointment", function(assert) {
  assert.expect(1);

  visit(`/orders/${designationAppointment.id}/order_types/`);

  andThen(function() {
    assert.equal(
      $(".order-booking-tab .type option:selected")
        .text()
        .trim(),
      "Appointment"
    );
  });
});

test("An order's schedule can be updated by clicking on the schedule line", function(assert) {
  assert.expect(3);

  let putRequestSent = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/order_transport*",
      type: "PUT",
      status: 200,
      onAfterComplete: () => {
        putRequestSent = true;
      },
      response: req => {
        return JSON.parse(req.data);
      }
    })
  );

  visit(`/orders/${designationAppointment.id}/order_types/`);

  andThen(() => {
    const rescheduleBtn = Ember.$(".order-booking-tab .reschedule");
    assert.equal(rescheduleBtn.length, 1);
    click(rescheduleBtn);
  });

  andThen(() => {
    const updateBtn = Ember.$(".order-booking-tab .reveal-modal  #btn1");
    assert.equal(updateBtn.length, 1);
    click(updateBtn);
  });

  andThen(() => {
    assert.ok(putRequestSent);
  });
});
