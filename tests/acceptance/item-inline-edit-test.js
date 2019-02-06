import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/designation';
import '../factories/item';
import '../factories/location';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, pkg;

module('Acceptance: Item inline edit', {
  beforeEach: function() {
    App = startApp({}, 2);
    var location = FactoryGuy.make("location");
    var designation = FactoryGuy.make("designation");
    var bookingType = FactoryGuy.make("booking_type");
    pkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 10, width: 15, length: 20, notes: "Inline edit test" });
    mockFindAll('designation').returns({json: {designations: [designation.toJSON({includeId: true})]}});
    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
        items: [pkg.toJSON({includeId: true})]
        }
    });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};

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

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });
    mockFindAll('item').returns({ json: {items: [pkg.toJSON({includeId: true})]}});
    mockFindAll("booking_type").returns({json: {booking_types: [bookingType.toJSON({includeId: true})]}});

    visit("/");
    andThen(function() {
      visit("/items");
    });
    andThen(function() {
      fillIn("#searchText", pkg.get("inventoryNumber"));
    });
    andThen(function() {
      visit("items/" + pkg.id);
    });
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Filling same description doesn't fire request for update", function(assert) {
  assert.expect(1);
  //filling same description
  fillIn(find('.description-textarea'), "Inline edit test");
  //clicking on qty to fire focusOut event of description textarea
  click('.value');
  assert.equal(pkg.get('notes'), "Inline edit test");
  //if request was fired then this test case would have failed because mocking is not used here so we can say that request is not fired
});

test("Filling different description fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 10, width: 15, length: 20, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //filling different description
  fillIn(find('.description-textarea'), "Item description changed");
  //clicking on qty to fire focusOut event of description textarea
  click('.value');
  andThen(function() {
    assert.equal(find('.description-textarea').val(), "Item description changed");
  });
});

test("Filling same length doesn't fire request for update", function(assert) {
  assert.expect(1);
  //filling same length
  fillIn(find('.item-length'), "20");
  //clicking on qty to fire focusOut event of length textfield
  click('.value');
  assert.equal(pkg.get('length'), "20");
  //if request was fired then this test case would have failed because mocking is not used here so we can say that request is not fired
});

test("Filling different length fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 10, width: 15, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //filling different length
  fillIn(find('.item-length'), "50");
  //clicking on qty to fire focusOut event of length textfield
  click('.value');
  andThen(function() {
    assert.equal(find('.item-length').val(), "50");
  });
});

test("Filling same width doesn't fire request for update", function(assert) {
  assert.expect(1);
  //filling same width
  fillIn(find('.item-width'), "15");
  //clicking on qty to fire focusOut event of width textfield
  click('.value');
  assert.equal(pkg.get('width'), "15");
  //if request was fired then this test case would have failed because mocking is not used here so we can say that request is not fired
});

test("Filling different width fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 10, width: 30, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //filling different width
  fillIn(find('.item-width'), "30");
  //clicking on qty to fire focusOut event of width textfield
  click('.value');
  andThen(function() {
    assert.equal(find('.item-width').val(), "30");
  });
});

test("Filling same height doesn't fire request for update", function(assert) {
  assert.expect(1);
  //filling same height
  fillIn(find('.item-height'), "10");
  //clicking on qty to fire focusOut event of height textfield
  click('.value');
  assert.equal(pkg.get('height'), "10");
  //if request was fired then this test case would have failed because mocking is not used here so we can say that request is not fired
});

test("Filling different height fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 20, width: 30, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //filling different height
  fillIn(find('.item-height'), "20");
  //clicking on qty to fire focusOut event of height textfield
  click('.value');
  andThen(function() {
    assert.equal(find('.item-height').val(), "20");
  });
});

test("Selecting different grade fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 20, width: 30, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //selecting different grade
  click(find('.grade-margin'));
  andThen(function() {
    //selecting B grade
    click($('.grade-margin select option:eq(1)')[0]);
  });
  andThen(function() {
    assert.equal($(".grade-margin select option:selected").text().trim().substr(0,1), "B");
  });
});

test("Selecting different condition fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 20, width: 30, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
  //selecting different condition
  click(find('.grade-margin'));
  andThen(function() {
    //selecting Used condition
    click($('.select-condition select option:eq(2)')[0]);
  });
  andThen(function() {
    assert.equal($(".select-condition select option:selected").text().trim(), "Used");
  });
});

test("Filling same donation(CAS) doesn't fires request for update", function(assert) {
  assert.expect(1);
  //filling same donation
  fillIn(find('.donation-input'), '');
  //clicking on qty to fire focusOut event of donation textfield
  click('.value');
  andThen(function() {
    assert.equal($('.donation-input').val(), '');
  });
});

test("Filling different condition fires request for update", function(assert) {
  var updatedPkg = FactoryGuy.make("item", { id: 50, state: "submitted" , quantity: 1, height: 20, width: 30, length: 50, notes: "Item description changed" });
  //mocking is used as request is fired
  $.mockjax({url: '/api/v1/stockit_item*', type: 'GET', status: 200,responseText: {
      items: [updatedPkg.toJSON({includeId: true})]
      }
    });
  assert.expect(1);
 //filling different donation
  fillIn(find('.donation-input'), 'CAS-12345');
  //clicking on qty to fire focusOut event of donation textfield
  click('.value');
  andThen(function() {
    assert.equal($('.donation-input').val(), 'CAS-12345');
  });
});

test("Filling invalid condition gives validation error", function(assert) {
  assert.expect(1);
 //filling invalid donation
  fillIn(find('.donation-input'), '123');
  //clicking on qty to fire focusOut event of donation textfield
  click('.value');
  andThen(function() {
    assert.equal($('.donation-input-error').text(), 'Must be in the form "CAS-12345"');
  });
});
