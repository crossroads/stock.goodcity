import Ember from 'ember';
import startApp from '../helpers/start-app';
import { module, test } from 'qunit';
import '../factories/designation';
import '../factories/location';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, data, userData;

module('Acceptance: Dashboard', {
  beforeEach: function() {
    App = startApp({}, 2);
    var location = FactoryGuy.make("location");
    var designation = FactoryGuy.make("designation");
    data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Order fulfilment"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};

    userData = {"user_profile": [{"id": 3,"first_name": "David", "last_name": "Dara51", "mobile": "61111112", "user_role_ids": [2]}], "users": [{"id": 3,"first_name": "David", "last_name": "Dara51", "mobile": "61111112"}], "roles": [{"id": 5, "name": "Supervisor"}], "user_roles": [{"id": 2, "user_id": 3, "role_id": 5}]};

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    var summary = {"submitted":1,"awaiting_dispatch":4,"dispatching":4,"processing":2,"priority_awaiting_dispatch":4,"priority_dispatching":2,"priority_submitted":3,"priority_processing":1};
    $.mockjax({url:"/api/v1/orders/sum*",
      responseText:  summary
    });

    $.mockjax({url:"/api/v1/designat*",
      responseText:  {designations: [designation.toJSON({includeId: true})]}
    });
    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});

    visit("/orders");
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Order fulfilment user can view dashboard element", function(assert) {
  assert.expect(2);

  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal($('.recent_orders').length, 2);
  });
});

// test("Other than Order fulfilment user cannot view dashboard element", function(assert) {
//   assert.expect(2);

//   // $.mockjax({url:"/api/v1/auth/current_user_profile",type: 'GET', status: 200,
//   //   responseText: userData });

//   visit("/");

//   andThen(function() {
//     assert.equal(currentURL(), "/");
//     assert.equal($('.recent_orders').length, 0);
//   });
// });


test("Showing count of each type of Order type", function(assert) {
  assert.expect(9);

  visit("/");
  andThen(function() {
    //Non-priority Orders count
    assert.equal(currentURL(), "/");
    assert.equal($('.submitted i').eq(0).text().trim(), 1);
    assert.equal($('.processing i').eq(0).text().trim(), 2);
    assert.equal($('.awaiting_dispatch i').eq(0).text().trim(), 4);
    assert.equal($('.dispatching i').eq(0).text().trim(), 4);

    //Non-priority Orders count
    assert.equal($('.submitted i').eq(1).text().trim(), 3);
    assert.equal($('.processing i').eq(1).text().trim(), 1);
    assert.equal($('.awaiting_dispatch i').eq(1).text().trim(), 4);
    assert.equal($('.dispatching i').eq(1).text().trim(), 2);
  });
});

test("Clicking order type redirects to order page with order type list populated", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal($('.submitted i').eq(0).text().trim(), 1);
    click(Ember.$('.submitted')[0]);
    andThen(function(){
      assert.equal(currentURL(), '/orders?isFiltered=true');
    })
  });
});

test("Clicking order type redirects to order page and selects filter of clicked order type", function(assert) {
  visit("/");
  andThen(function() {
    assert.equal(currentURL(), "/");
    assert.equal($('.submitted i').eq(0).text().trim(), 1);
    click(Ember.$('.submitted')[0]);
    andThen(function(){
      assert.equal(currentURL(), '/orders?isFiltered=true');
      assert.equal(Ember.$('#order-state-filter').text(), 'Submitted');
    })
  });
});
