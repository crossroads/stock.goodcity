import Ember from "ember";
import _ from "lodash";
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
import MockUtils from "../helpers/mock-utils";

var App, beneficiary, location, code;

module("Acceptance: Order Client summary", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockEmptyPreload();
    MockUtils.mockUserProfile();
    MockUtils.mockOrderSummary();

    beneficiary = FactoryGuy.make("beneficiary", {
      identity_type: FactoryGuy.make("identity_type")
    });
    location = FactoryGuy.make("location");
    code = FactoryGuy.make("code", { location: location });
    const designation = FactoryGuy.make("designation", {
      detailType: "GoodCity",
      code: "GC-00001",
      beneficiaryId: beneficiary.id,
      beneficiary
    }).toJSON({ includeId: true });

    MockUtils.mock({
      url: "/api/v1/beneficiar*",
      responseText: { beneficiary: beneficiary }
    });
    MockUtils.mockWithRecords("designation", [designation]);
    MockUtils.mockWithRecords(
      "cancellation_reason",
      _(3).times(() => FactoryGuy.make("cancellation_reason"))
    );

    visit("/orders/" + designation.id + "/client_summary");
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
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
