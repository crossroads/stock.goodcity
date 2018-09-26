import { test, moduleForModel } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('designation', 'Designation model',{
  needs: ['model:order-transport', 'model:gc_organisation' ,'model:stockit_contact', 'model:organisation', 'model:local_order', 'model:item', 'model:orders_package', 'model:location', 'model:code', 'model:donor_condition', 'model:set_item', 'model:packages_location', 'model:image', 'model:orders_purpose', 'service:utilityMethods', 'service:i18n']
});

test('check attributes', function(assert){

  assert.expect(9);

  var model = this.subject();
  var status = Object.keys(model.toJSON()).indexOf('status') > -1;
  var createdAt = Object.keys(model.toJSON()).indexOf('createdAt') > -1;
  var recentlyUsedAt = Object.keys(model.toJSON()).indexOf('recentlyUsedAt') > -1;
  var code = Object.keys(model.toJSON()).indexOf('code') > -1;
  var activity = Object.keys(model.toJSON()).indexOf('activity') > -1;
  var description = Object.keys(model.toJSON()).indexOf('description') > -1;
  var purposeDescription = Object.keys(model.toJSON()).indexOf('purposeDescription') > -1;
  var detailType = Object.keys(model.toJSON()).indexOf('detailType') > -1;
  var detailId = Object.keys(model.toJSON()).indexOf('detailId') > -1;

  assert.ok(status);
  assert.ok(purposeDescription);
  assert.ok(createdAt);
  assert.ok(recentlyUsedAt);
  assert.ok(code);
  assert.ok(activity);
  assert.ok(description);
  assert.ok(detailType);
  assert.ok(detailId);

});

test('Relationships with other models', function(assert){
  assert.expect(12);
  var designation = this.store().modelFor('designation');
  var relationshipWithStockitContact = Ember.get(designation, 'relationshipsByName').get('stockitContact');
  var relationshipWithOrganisation = Ember.get(designation, 'relationshipsByName').get('organisation');
  var relationshipWithLocalOrder = Ember.get(designation, 'relationshipsByName').get('localOrder');
  var relationshipWithItem = Ember.get(designation, 'relationshipsByName').get('items');
  var relationshipOrdersPackage = Ember.get(designation, 'relationshipsByName').get('ordersPackages');
  var relationshipOrdersPurpose = Ember.get(designation, 'relationshipsByName').get('ordersPurposes');

  assert.equal(relationshipWithStockitContact.key, "stockitContact");
  assert.equal(relationshipWithStockitContact.kind, "belongsTo");

  assert.equal(relationshipWithOrganisation.key, 'organisation');
  assert.equal(relationshipWithOrganisation.kind, 'belongsTo');

  assert.equal(relationshipWithLocalOrder.key, 'localOrder');
  assert.equal(relationshipWithLocalOrder.kind, 'belongsTo');

  assert.equal(relationshipWithItem.key, 'items');
  assert.equal(relationshipWithItem.kind, 'hasMany');

  assert.equal(relationshipOrdersPackage.key, 'ordersPackages');
  assert.equal(relationshipOrdersPackage.kind, 'hasMany');

  assert.equal(relationshipOrdersPurpose.key, 'ordersPurposes');
  assert.equal(relationshipOrdersPurpose.kind, 'hasMany');
});

test('check isLocalOrder', function(assert){
  var model = this.subject({detailType: 'LocalOrder'});
  assert.equal(model.get('isLocalOrder'), true);
});

test('check dispatchedItems returns items with sentOn not null', function(assert){
  assert.expect(2);
  var item1, item2, item3, despatchedItemsIds, model, store;
  model = this.subject();
  store = this.store();

  Ember.run(function(){
    item1 = store.createRecord('item', { id: 1, sentOn: "12/07/2016" });
    item2 = store.createRecord('item', { id: 2, sentOn: "12/07/2016" });
    item3 = store.createRecord('item', { id: 3, sentOn: null });
    model.get('items').pushObjects([item1, item2, item3]);
  });

  despatchedItemsIds = model.get('dispatchedItems').getEach('id');
  assert.equal(despatchedItemsIds.get('length'), 2);
  assert.equal(Ember.compare(despatchedItemsIds, [item1.get("id"), item2.get("id")]), 0);
});

test('check designatedItems returns items with sentOn null', function(assert){
  assert.expect(2);
  var item1, item2, item3, designatedItemsIds, model, store;
  model = this.subject();
  store = this.store();

  Ember.run(function(){
    item1 = store.createRecord('item', { id: 1, sentOn: null });
    item2 = store.createRecord('item', { id: 2, sentOn: null });
    item3 = store.createRecord('item', { id: 3, sentOn: "12/07/2016" });
    model.get('items').pushObjects([item1, item2, item3]);
  });

  designatedItemsIds = model.get('designatedItems').getEach('id');
  assert.equal(designatedItemsIds.get('length'), 2);
  assert.equal(Ember.compare(designatedItemsIds, [item1.get('id'), item2.get('id')]), 0);
});

test('check designatedOrdersPackages returns only designated orders_packages', function(assert){
  assert.expect(2);
  var orders_package1, orders_package2, orders_package3, designatedOrdersPackagesIds, model, store;
  model = this.subject();
  store = this.store();

  Ember.run(function(){
    orders_package1 = store.createRecord('orders_package', {id: 1, state: 'designated'});
    orders_package2 = store.createRecord('orders_package', {id: 2, state: 'designated'});
    orders_package3 = store.createRecord('orders_package', {id: 3, state: 'dispatched'});
    model.get('ordersPackages').pushObjects([orders_package1, orders_package2, orders_package3]);
  });

  designatedOrdersPackagesIds = model.get('designatedOrdersPackages').getEach('id');

  assert.equal(designatedOrdersPackagesIds.get('length'),2);
  assert.equal(Ember.compare(designatedOrdersPackagesIds, [orders_package1.get('id'), orders_package2.get('id')]), 0);
});

test('check dispatchedOrdersPackages returns only dispatched orders_packages', function(assert){
  assert.expect(2);
  var orders_package1, orders_package2, orders_package3, dispatchedOrdersPackagesIds, model, store;
  model = this.subject();
  store = this.store();

  Ember.run(function(){
    orders_package1 = store.createRecord('orders_package', {id: 1, state: 'dispatched'});
    orders_package2 = store.createRecord('orders_package', {id: 2, state: 'dispatched'});
    orders_package3 = store.createRecord('orders_package', {id: 3, state: 'designated'});
    model.get('ordersPackages').pushObjects([orders_package1, orders_package2, orders_package3]);
  });

  dispatchedOrdersPackagesIds = model.get('dispatchedOrdersPackages').getEach('id');
  assert.equal(dispatchedOrdersPackagesIds.get('length'),2);
  assert.equal(Ember.compare(dispatchedOrdersPackagesIds, [orders_package1.get('id'), orders_package2.get('id')]), 0);
});

test('check allItemsDispatched returns true if all Items are dispatched otherwise returns false', function(assert){
  assert.expect(2);
  var item1, item2, item3, unDispatcheditem, store, designation1, designation2;
  store = this.store();
  Ember.run(function(){

    designation1 = store.createRecord('designation', {
                    id:               5,
                    detailType:       'StockitLocalOrder',
                    status:           'Active',
                    createdAt:        '12/07/2016',
                    updatedAt:        '12/07/2016'
                  });

    designation2 = store.createRecord('designation', {
                    id:               6,
                    detailType:       'StockitLocalOrder',
                    status:           'Active',
                    createdAt:        '12/07/2016',
                    updatedAt:        '12/07/2016'
                  });

    item1 = store.createRecord('item', { id: 1, isDispatched: true });
    item2 = store.createRecord('item', { id: 2, isDispatched: true });
    item3 = store.createRecord('item', { id: 3, isDispatched: true });
    unDispatcheditem = store.createRecord('item', { id: 4, isDispatched: false });

    designation1.get('items').pushObjects([item1, item2]);
    designation2.get('items').pushObjects([item3, unDispatcheditem]);
  });
  assert.equal(designation1.get('allItemsDispatched'), true);
  assert.equal(designation2.get('allItemsDispatched'), false);
});

test('check isInactive', function(assert){
  var designation, store;
  store = this.store();

  Ember.run(function(){
    designation = store.createRecord('designation', {
      id:               4,
      detailType:       'StockitLocalOrder',
      status:           'Sent',
      createdAt:        '12/07/2016',
      updatedAt:        '12/07/2016'
    });
  });
  assert.equal(designation.get('isInactive'), true);
});
