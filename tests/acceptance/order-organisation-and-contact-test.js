import Ember from "ember";
import _ from "lodash";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/beneficiary";
import "../factories/identity_type";
import "../factories/organisation";
import "../factories/user";
import "../factories/location";
import "../factories/organisations_user";
import MockUtils from "../helpers/mock-utils";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";

var App,
  designation,
  item1,
  orders_package1,
  organisation,
  beneficiary,
  identity_type,
  user,
  organisation_user,
  bookingType,
  data,
  orders_count;

module("Acceptance: Order summary", {
  beforeEach: function() {
    App = startApp({}, 2);
    MockUtils.startSession();
    MockUtils.mockDefault();
    MockUtils.mockOrderSummary();
    orders_count = { cancelled: 21, dispatching: 34, submitted: 23, closed: 6 };
    user = FactoryGuy.make("user", {
      mobile: "123456",
      email: "abc@xyz"
    });
    var location = FactoryGuy.make("location");
    organisation = FactoryGuy.make("organisation");
    bookingType = FactoryGuy.make("booking_type");
    identity_type = FactoryGuy.make("identity_type");
    beneficiary = FactoryGuy.make("beneficiary", {
      identity_type: identity_type
    });
    organisation_user = FactoryGuy.make("organisationsUser", {
      organisation,
      user: user
    });
    designation = FactoryGuy.make("designation", {
      state: "submitted",
      detailType: "GoodCity",
      beneficiary: beneficiary,
      organisation,
      createdBy: user
    });
    item1 = FactoryGuy.make("item", {
      state: "submitted",
      quantity: 0,
      designation: designation
    });
    orders_package1 = FactoryGuy.make("orders_package", {
      state: "dispatched",
      quantity: 1,
      item: item1,
      designation: designation
    });

    MockUtils.mock({
      url: "/api/v1/designations/*",
      type: "GET",
      status: 200,
      responseText: {
        designations: [
          designation.toJSON({
            includeId: true
          })
        ],
        orders_packages: [
          orders_package1.toJSON({
            includeId: true
          })
        ]
      }
    });

    MockUtils.mock({ url: `/api/v1/users/*`, responseText: orders_count });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    andThen(function() {
      visit("/orders/" + designation.id + "/contact_summary");
    });

    mockFindAll("location").returns({
      json: {
        locations: [
          location.toJSON({
            includeId: true
          })
        ]
      }
    });

    MockUtils.mockWithRecords(
      "cancellation_reason",
      _(3).times(() => FactoryGuy.make("cancellation_reason"))
    );

    mockFindAll("designation").returns({
      json: {
        designations: [
          designation.toJSON({
            includeId: true
          })
        ],
        items: [
          item1.toJSON({
            includeId: true
          })
        ],
        orders_packages: [
          orders_package1.toJSON({
            includeId: true
          })
        ],
        meta: {
          search: designation.get("code").toString()
        }
      }
    });
    mockFindAll("orders_package").returns({
      json: {
        orders_packages: [
          orders_package1.toJSON({
            includeId: true
          })
        ]
      }
    });
    mockFindAll("booking_type").returns({
      json: {
        booking_types: [
          bookingType.toJSON({
            includeId: true
          })
        ]
      }
    });
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Order summary detail", function(assert) {
  assert.expect(11);
  assert.equal(currentPath(), "orders.contact_summary");
  assert.equal(
    $(".organisation_name")
      .text()
      .trim(),
    organisation.get("nameEn")
  );
  assert.equal(
    $("#contact_name")
      .text()
      .trim(),
    designation.get("createdBy.fullName")
  );
  assert.equal(
    $("#contact_mobile")
      .text()
      .trim(),
    designation.get("createdBy.mobile")
  );
  assert.equal(
    $("#contact_position")
      .text()
      .trim(),
    designation.get("createdBy.position")
  );
  assert.equal(
    $("#contact_email")
      .text()
      .trim(),
    designation.get("createdBy.email")
  );
  assert.equal(
    $("#preferred_contact_number")
      .text()
      .trim(),
    organisation_user.get("preferredContactNumber")
  );
  assert.equal(
    Ember.$("#submitted_count")
      .text()
      .trim(),
    orders_count.submitted
  );
  assert.equal(
    $("#dispatching_count")
      .text()
      .trim(),
    orders_count.dispatching
  );
  assert.equal(
    $("#cancelled_count")
      .text()
      .trim(),
    orders_count.cancelled
  );
  assert.equal(
    $("#closed_count")
      .text()
      .trim(),
    orders_count.closed
  );
});
