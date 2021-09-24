import Ember from "ember";
import _ from "lodash";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/user";
import "../factories/designation";
import "../factories/location";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
import MockUtils from "../helpers/mock-utils";

var App, hk_user, non_hk_user, bookingType, codes;

module("Acceptance: Login", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockUserProfile();
    MockUtils.mockEmptyPreload();

    let location = FactoryGuy.make("location");
    let designation = FactoryGuy.make("designation");
    bookingType = FactoryGuy.make("booking_type");
    codes = FactoryGuy.make("code");
    mockFindAll("designation").returns({
      json: { designations: [designation.toJSON({ includeId: true })] }
    });
    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    MockUtils.mockWithRecords(
      "cancellation_reason",
      _(3).times(() => FactoryGuy.make("cancellation_reason"))
    );
    hk_user = FactoryGuy.make("with_hk_mobile");
    non_hk_user = FactoryGuy.make("with_non_hk_mobile");
    window.localStorage.removeItem("authToken");
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("User able to enter mobile number and get the sms code", function(assert) {
  assert.expect(1);
  $.mockjax({
    url: "/api/v1/auth/signup_and_send_pi*",
    responseText: {
      otp_auth_key: "/JqONEgEjrZefDV3ZIQsNA=="
    }
  });
  visit("/login");
  fillIn("#mobile", hk_user.get("mobile"));
  triggerEvent("#mobile", "blur");
  click("#getsmscode");

  andThen(function() {
    assert.equal(currentURL(), "/authenticate");
  });
});

test("User is able to resend the sms code", function(assert) {
  assert.expect(1);

  $.mockjax({
    url: "/api/v1/auth/signup_and_send_pi*",
    responseText: {
      otp_auth_key: "/JqONEgEjrZefDV3ZIQsNA=="
    }
  });

  visit("/authenticate");

  click("#resend-pin");

  andThen(function() {
    assert.equal(window.localStorage.otpAuthKey, '"/JqONEgEjrZefDV3ZIQsNA=="');
  });
});

test("User is able to enter sms code and confirm and redirected to Home page and is able to logout", function(assert) {
  assert.expect(3);

  $.mockjax({
    url: "/api/v1/auth/verif*",
    responseText: {
      jwt_token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJpYXQiOjE1MjU5MjQ0NzYsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjEzNTI1OTI0NDc2fQ.lO6AdJtFrhOI9VaGRR55Wq-YWmeNoLagZthsIW39b2k"
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

  $.mockjax({
    url: "/api/v1/package_typ*",
    responseText: {
      codes: [codes.toJSON({ includeId: true })]
    }
  });

  var authToken =
    '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
  visit("/authenticate");
  fillIn("#pin", "1234");
  triggerEvent("#pin", "blur");

  andThen(function() {
    assert.equal(find("#pin").val().length, 4);
    window.localStorage.authToken = authToken;
  });

  andThen(function() {
    click("#submit_pin");
    visit("/");
  });

  andThen(function() {
    assert.equal(currentURL(), "/");
  });

  andThen(function() {
    click(".fa-bars");
  });

  andThen(function() {
    click("a:contains('Logout')");
  });

  andThen(function() {
    assert.equal(typeof window.localStorage.authToken, "undefined");
  });
});
