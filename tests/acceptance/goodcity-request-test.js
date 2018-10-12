import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/designation';
import '../factories/item';
import '../factories/goodcity_request';
import '../factories/location';
import '../factories/code';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, designation1, request, code;

module('Acceptance: Goodcity Request test', {
  beforeEach: function() {
    App = startApp({}, 2);
    designation1 = FactoryGuy.make("designation", { state: "processing", detailType: "GoodCity", code: "GC-00001" });
    var location = FactoryGuy.make("location");
    code = FactoryGuy.make("code", { location: location });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    request = FactoryGuy.make("goodcity_request", { quantity: 1, designation: designation1, code: code });
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    $.mockjax({url: '/api/v1/goodcity_request*', type: 'POST', status: 201,responseText: {
        goodcity_requests: [request.toJSON({includeId: true})]
      }
    });
    mockFindAll('designation').returns({ json: {designations: [designation1.toJSON({includeId: true})],
      items: [],
      orders_packages: [], meta: {search: designation1.get('code').toString()}}});
    mockFindAll('orders_package').returns({ json: {orders_packages: []}});
    $.mockjax({url: '/api/v1/package_type*', type: 'GET', status: 200,responseText: {
        codes: [code.toJSON({includeId: true})]
      }
    });

    $.mockjax({url: "/api/v1/designations/*", type: 'GET', status: 200,responseText: {
      designations: [designation1.toJSON({includeId: true})],
      orders_packages: []
    }});

    visit("/orders/" + designation1.id + "/requested_items");
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});


test("Add a request to order", function(assert) {
  assert.expect(4);
  $.mockjax({url: "/api/v1/designations/*", type: 'GET', status: 200,responseText: {
    designations: [designation1.toJSON({includeId: true})],
    orders_packages: []
  }});

  visit("/orders/" + designation1.id + "/requested_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
    //clicking on Add request button
    click($('#requestbtn')[0]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.search_code");
    //click on first package_type
    click(find('.list li:first')[0]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.add_request");
    //click on first package_type
    click($('.button.expand')[1]);
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
  });
});

test("Deleting request from order", function(assert) {
  assert.expect(2);

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
    //clicking on Add request button
    click($('.fa-times-circle')[0]);
  });

  andThen(function() {
    click($('#messageBox #btn1'));
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.requested_items");
  });
});

// test("Editing Request", function(assert) {
//   assert.expect(2);
//   //filling same description
//   fillIn($('#qty' + request.id)[0], 1);
//   //clicking on qty to fire focusOut event of input
//   click('.request-quantity');
//   assert.equal(request.get('quantity'), 1);
//   fillIn($('#desc' + request.id)[0], "Test");
//   //clicking on qty to fire focusOut event of input
//   click('.request-quantity');
//   assert.equal(request.get('description'), "Test");
// });

