import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/location';
import '../factories/orders_purpose';
import '../factories/purpose';
import '../factories/designation';
import '../factories/item';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, designation, item, orders_package, orders_purpose, purpose;

module('Acceptance: Supervisor footer', {
  beforeEach: function() {
    App = startApp({}, 2);
    var location = FactoryGuy.make("location");
    var bookingType = FactoryGuy.make("booking_type");
    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    designation = FactoryGuy.make("designation", { detailType: "GoodCity", code:"GC-00001" });
    purpose = FactoryGuy.make("purpose", { nameEn: "Organisation" });
    orders_purpose = FactoryGuy.make("orders_purpose", { designationId: designation.id, purposeId: purpose.id, designation: designation, purpose: purpose });
    item = FactoryGuy.make("item", { state: "submitted" , designation: designation});
    orders_package = FactoryGuy.make("orders_package", { state: "designated", quantity: 6, item: item, designation: designation });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    var designationData ={designations: [designation.toJSON({includeId: true})], items: [item.toJSON({includeId: true})], orders_purposes: [orders_purpose.toJSON({includeId:true})], purposes: [purpose.toJSON({includeId:true})]};
    mockFindAll('booking_type').returns({json: {booking_types: [bookingType.toJSON({includeId: true})]}});

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });
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

    visit("/");

    $.mockjax({url: '/api/v1/designation*', type: 'GET', status: 200,responseText: designationData});
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Menu icon stay visible after switching tab from orders to item", function(assert) {
  visit("/orders" );
  assert.expect(2);
  andThen(function() {
    visit("/items");
  });
  andThen(function() {
    assert.equal(currentPath(), "items.index");
    assert.equal($('ul.list li:last').text().trim(), "Menu");
  });
});
