import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/orders_purpose';
import '../factories/purpose';
import '../factories/designation';
import '../factories/item';
import FactoryGuy from 'ember-data-factory-guy';

var App, designation, item, orders_package, orders_purpose, purpose, bookingType;

module('Acceptance: Order Detail', {
  beforeEach: function() {
    App = startApp({}, 2);
    designation = FactoryGuy.make("designation", { detailType: "GoodCity", code:"GC-00001" });
    purpose = FactoryGuy.make("purpose", { nameEn: "Organisation" });
    bookingType = FactoryGuy.make("booking_type");
    orders_purpose = FactoryGuy.make("orders_purpose", { designationId: designation.id, purposeId: purpose.id, designation: designation, purpose: purpose });
    item = FactoryGuy.make("item", { state: "submitted" , designation: designation});
    orders_package = FactoryGuy.make("orders_package", { state: "designated", quantity: 6, item: item, designation: designation });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    var designationData ={designations: [designation.toJSON({includeId: true})], items: [item.toJSON({includeId: true})], orders_purposes: [orders_purpose.toJSON({includeId:true})], purposes: [purpose.toJSON({includeId:true})]};

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    $.mockjax({url: '/api/v1/designation*', type: 'GET', status: 200,responseText: designationData});
    $.mockjax({url: '/api/v1/booking_ty*', type: 'GET', status: 200,responseText: { booking_types: [bookingType.toJSON({includeId: true})] }});

    visit("/orders/" + designation.id + '/purposes');
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Purpose name and description", function(assert) {
  assert.expect(3);

  andThen(function() {
    assert.equal(currentPath(), "orders.purposes");
    assert.equal($('.main_details div:eq(2)').text().trim(), "Test");
    assert.equal($('.main_details div:last').text().trim(), "Organisation");
  });
});
