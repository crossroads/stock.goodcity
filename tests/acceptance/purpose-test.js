import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/beneficiary";
import "../factories/identity_type";
import "../factories/orders_package";
import "../factories/orders_purpose";
import "../factories/purpose";
import "../factories/designation";
import "../factories/item";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";

var App,
  identity_type,
  beneficiary,
  designation,
  item,
  orders_package,
  orders_purpose,
  purpose,
  bookingType;

module("Acceptance: Order Client summary", {
  beforeEach: function() {
    App = startApp({}, 2);
    purpose = FactoryGuy.make("purpose", { nameEn: "Organisation" });
    bookingType = FactoryGuy.make("booking_type");
    identity_type = FactoryGuy.make("identity_type");
    beneficiary = FactoryGuy.make("beneficiary", {
      identity_type: identity_type
    });
    item = FactoryGuy.make("item", {
      state: "submitted",
      designation: designation
    });
    designation = FactoryGuy.make("designation", {
      detailType: "GoodCity",
      code: "GC-00001",
      beneficiary: beneficiary
    });
    orders_purpose = FactoryGuy.make("orders_purpose", {
      designationId: designation.id,
      purposeId: purpose.id,
      designation: designation,
      purpose: purpose
    });
    orders_package = FactoryGuy.make("orders_package", {
      state: "designated",
      quantity: 6,
      item: item,
      designation: designation
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
    var designationData = {
      designations: [designation.toJSON({ includeId: true })],
      items: [item.toJSON({ includeId: true })],
      orders_purposes: [orders_purpose.toJSON({ includeId: true })],
      purposes: [purpose.toJSON({ includeId: true })]
    };

    $.mockjax.clear();
    $.mockjax({ url: "/api/v1/auth/current_user_profil*", responseText: data });

    mockFindAll("designation").returns({
      json: {
        designations: [designation.toJSON({ includeId: true })],
        items: [item.toJSON({ includeId: true })],
        orders_packages: [orders_package.toJSON({ includeId: true })],
        meta: { search: designation.get("code").toString() }
      }
    });
    $.mockjax({
      url: "/api/v1/designation*",
      type: "GET",
      status: 200,
      responseText: designationData
    });
    $.mockjax({
      url: "/api/v1/booking_ty*",
      type: "GET",
      status: 200,
      responseText: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    mockFindAll("orders_package").returns({
      json: { orders_packages: [orders_package.toJSON({ includeId: true })] }
    });
    mockFindAll("purpose").returns({
      json: { purposes: [purpose.toJSON({ includeId: true })] }
    });
    visit("/orders/" + designation.id + "/client_summary");
  },
  afterEach: function() {
    Ember.run(App, "destroy");
    $.mockjax.clear();
  }
});

test("Purpose name and description", function(assert) {
  assert.expect(4);

  andThen(function() {
    assert.equal(currentPath(), "orders.client_summary");
    assert.equal(
      $("#beneficiary-title-select select")
        .val()
        .trim() +
        " " +
        $("#beneficiary-numeric-input").val(), // jshint ignore:line
      beneficiary.get("fullName")
    ); // jshint ignore:line
    assert.equal(
      $("#beneficiary-phone-input")
        .val()
        .trim(),
      beneficiary.get("phoneNumber")
    );
    assert.equal(
      $("#id_number input")
        .val()
        .trim(),
      beneficiary.get("identityNumber")
    );
  });
});
