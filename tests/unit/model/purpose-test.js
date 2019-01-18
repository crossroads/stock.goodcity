import { test, moduleForModel } from 'ember-qunit';

moduleForModel('purpose', 'Purpose Model', {
  needs: ['service:i18n']
});

test('check attributes', function(assert){
  assert.expect(1);
  var model = this.subject();
  var nameEn = Object.keys(model.toJSON()).indexOf('nameEn') > -1;

  assert.ok(nameEn);
});
