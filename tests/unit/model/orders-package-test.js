import { test, moduleForModel } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('orders_package', 'OrdersPackage Model', {
  needs: ['model:order-transport', 'model:gc_organisation', 'model:item', 'model:image', 'model:donor_condition', 'model:user', 'model:designation', 'model:code', 'model:location', 'model:contact', 'model:organisation', 'model:local-order', 'service:utilityMethods', 'service:i18n']
});

test('check attributes', function(assert){
  assert.expect(7);
  var model = this.subject();
  var packageId = Object.keys(model.toJSON()).indexOf('packageId') > -1;
  var orderId = Object.keys(model.toJSON()).indexOf('orderId') > -1;
  var itemId = Object.keys(model.toJSON()).indexOf('itemId') > -1;
  var designationId = Object.keys(model.toJSON()).indexOf('designationId') > -1;
  var quantity = Object.keys(model.toJSON()).indexOf('quantity') > -1;
  var sentOn = Object.keys(model.toJSON()).indexOf('sentOn') > -1;
  var state = Object.keys(model.toJSON()).indexOf('state') > -1;

  assert.ok(packageId);
  assert.ok(orderId);
  assert.ok(itemId);
  assert.ok(designationId);
  assert.ok(quantity);
  assert.ok(sentOn);
  assert.ok(state);
});

test('Relationships with other models', function(assert) {
  assert.expect(4);
  var OrdersPackage = this.store().modelFor('orders_package');
  var relationshipWithItem = Ember.get(OrdersPackage, 'relationshipsByName').get('item');
  var relationshipWithDesignation = Ember.get(OrdersPackage, 'relationshipsByName').get('designation');

  assert.equal(relationshipWithItem.key, 'item');
  assert.equal(relationshipWithItem.kind, 'belongsTo');
  assert.equal(relationshipWithDesignation.key, 'designation');
  assert.equal(relationshipWithDesignation.kind, 'belongsTo');
});

test('Checking computed properties', function(assert) {
  assert.expect(2);
  var orders_package = this.subject({ state: "designated", quantity: 6 });
  assert.equal(orders_package.get('availableQty'), 6);
  assert.equal(orders_package.get('isSingleQuantity'), false);
});

test('OrdersPackage is a valid ember-data Model', function(assert) {
  assert.expect(1);

  var store  = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord('orders_package', {id: 1, state: 'designated', quantity: 5});
    record = store.peekRecord('orders_package', 1);
  });

  assert.equal(record.get('state'), 'designated');
});

test('check orderCode computed property', function(assert){
  var model, store, designation, code;
  model = this.subject();
  store = this.store();

  Ember.run(function(){
    code = store.createRecord('code', {
      id                      : 1,
      name                    : 'codename',
      code                    : "BBS",
      otherChildPackages      : "FXX",
      defaultChildPackages    : "BBS",
      otherTerms              : "Cot",
      visibleInSelects        : true
    });

    designation = store.createRecord('designation',{
      id                :1,
      code              :code,
      detailType        :'StockitLocalOrder',
      status            :'Active',
      createdAt         :'12/07/2016',
      updatedAt         :'12/07/2016'
    });

    model.set('designation', designation);
  });

  assert.equal(model.get('orderCode'), code);
});
