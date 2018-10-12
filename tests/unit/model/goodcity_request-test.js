import { test, moduleForModel } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('goodcity_request', 'GoodcityRequest Model', {
  needs: ['model:code', 'model:designation']
});

test('check attributes', function(assert){
  assert.expect(2);
  var model = this.subject();
  var quantity = Object.keys(model.toJSON()).indexOf('quantity') > -1;
  var description = Object.keys(model.toJSON()).indexOf('description') > -1;

  assert.ok(quantity);
  assert.ok(description);
});

test('Relationships with other models', function(assert) {
  assert.expect(4);
  var Request = this.store().modelFor('goodcity_request');
  var relationshipWithCode = Ember.get(Request, 'relationshipsByName').get('code');
  var relationshipWithDesignation = Ember.get(Request, 'relationshipsByName').get('designation');

  assert.equal(relationshipWithCode.key, 'code');
  assert.equal(relationshipWithCode.kind, 'belongsTo');
  assert.equal(relationshipWithDesignation.key, 'designation');
  assert.equal(relationshipWithDesignation.kind, 'belongsTo');
});
