import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/designation';
import '../factories/item';
import '../factories/beneficiary';
import '../factories/identity_type';
import '../factories/gc_organisation';
import '../factories/user';
import '../factories/location';
import '../factories/organisations_user';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, designation, item1, orders_package1, gc_organisation, beneficiary, identity_type, user, organisation_user, bookingType, data, request;

module('Acceptance: Order summary', {
  beforeEach: function() {
    App = startApp({}, 2);
    user = FactoryGuy.make("user", { mobile: "123456", email: "abc@xyz" });
    var location = FactoryGuy.make("location");
    gc_organisation = FactoryGuy.make("gc_organisation");
    bookingType = FactoryGuy.make("booking_type");
    identity_type = FactoryGuy.make('identity_type');
    beneficiary = FactoryGuy.make('beneficiary', { identity_type: identity_type });
    organisation_user = FactoryGuy.make("organisationsUser", { gcOrganisation: gc_organisation, user: user });
    designation = FactoryGuy.make("designation", { state: "submitted", detailType: "GoodCity", goodcityRequests: request, gcOrganisation: gc_organisation, beneficiaryId: beneficiary.id, createdBy: user, userCancelledOrderCount: 21, userAwaitingDispatchOrderCount: 34, userSubmittedOrderCount: 23, userClosedOrderCount: 6, peopleHelped: '2', purposeDescription: 'Test' });
    request = FactoryGuy.make("goodcity_request", { quantity: 1, designation: designation});
    item1 = FactoryGuy.make("item", { state: "submitted", quantity: 0 , designation: designation});
    orders_package1 = FactoryGuy.make("orders_package", { state: "dispatched", quantity: 1, item: item1, designation: designation });
    data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    $.mockjax({url: "/api/v1/designations/*", type: 'GET', status: 200,responseText: {
      designations: [designation.toJSON({includeId: true})],
      orders_packages: [orders_package1.toJSON({includeId: true})]
    }});

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

    $.mockjax({url: "api/v1/beneficiar*"+ beneficiary.id ,type: 'DELETE',status: 200,responseText: {}});
    $.mockjax({url: '/api/v1/orders*', type: 'PUT', status: 200,responseText: {
     designations: []
    }});

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    andThen(function(){
      visit("/orders/" + designation.id + "/contact_summary");
    });

    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    mockFindAll('designation').returns({ json: {designations: [designation.toJSON({includeId: true})], items: [item1.toJSON({includeId: true})], orders_packages: [orders_package1.toJSON({includeId: true})], meta: {search: designation.get('code').toString()}}});
    mockFindAll('orders_package').returns({ json: {orders_packages: [orders_package1.toJSON({includeId: true})]}});
    mockFindAll('booking_type').returns({ json: {booking_types: [bookingType.toJSON({includeId: true})]}});

  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Order summary detail", function(assert) {
  assert.expect(10);
  assert.equal(currentPath(), "orders.contact_summary");
  assert.equal($('.organisation_name').text().trim(), gc_organisation.get("nameEn"));
  assert.equal($('#contact_name').text().trim(), designation.get("createdBy.fullName"));
  assert.equal($('#contact_mobile').text().trim(), designation.get("createdBy.mobile"));
  assert.equal($('#contact_position').text().trim(), designation.get("createdBy.position"));
  assert.equal($('#contact_email').text().trim(), designation.get("createdBy.email"));
  assert.equal($('#submitted_count').text().trim(), designation.get("userSubmittedOrderCount"));
  assert.equal($('#scheduled_count').text().trim(), designation.get("userAwaitingDispatchOrderCount"));
  assert.equal($('#cancelled_count').text().trim(), designation.get("userCancelledOrderCount"));
  assert.equal($('#closed_count').text().trim(), designation.get("userClosedOrderCount"));
});

test("Clicking Client/Purpose lands to Client Page", function(assert) {
  assert.equal(currentPath(), "orders.contact_summary");
  click($('#client_tab'));
  andThen(function() {
    assert.equal(currentPath(), "orders.client_summary");
  });
});

test("Client/Purpose displays beneficiary details", function(assert) {
  assert.expect(8);
  assert.equal(currentPath(), "orders.contact_summary");
  click($('#client_tab'));
  andThen(function() {
    assert.equal(currentPath(), "orders.client_summary");
    assert.equal($('.beneficiary-title').val(), designation.get("beneficiary.fullNameWithoutTitle"));
    assert.equal($('.beneficiary-phone').val(), designation.get("beneficiary.mobileWithoutCountryCode"));
    assert.equal($('.beneficiary-identity-type').val(), designation.get("beneficiary.identityType.name"));
    assert.equal($('.identity-number').val(), designation.get("beneficiary.identityNumber"));
    assert.equal($('.people-helped').val(), designation.get("peopleHelped"));
    assert.equal($('.order-description-textarea').val(), designation.get("purposeDescription"));
  });
});
