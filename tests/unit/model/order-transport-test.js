import { test, moduleForModel } from 'ember-qunit';

moduleForModel('order_transport', 'Ordertransport Model', {
  needs: ['model:contact', 'model:designation', 'model:gogovan_transport', 'service:i18n']
});

test('check attributes', function(assert){
  var model = this.subject();
  var gogovanOrderId = Object.keys(model.toJSON()).indexOf('gogovanOrderId') > -1;
  var gogovanTransportId = Object.keys(model.toJSON()).indexOf('gogovanTransportId') > -1;
  var transportType = Object.keys(model.toJSON()).indexOf('transportType') > -1;
  var vehicleType = Object.keys(model.toJSON()).indexOf('vehicleType') > -1;
  var scheduledAt = Object.keys(model.toJSON()).indexOf('scheduledAt') > -1;

  assert.ok(gogovanOrderId);
  assert.ok(gogovanTransportId);
  assert.ok(transportType);
  assert.ok(vehicleType);
  assert.ok(scheduledAt);
});

test('scheduledDate returns date in D MM YYYY format', function(assert) {
  assert.expect(1);
  var order_transport = this.subject({ scheduledAt: 1520418712981 });
  assert.equal(order_transport.get('scheduledDate'), "7 March 2018");
});

test('type returns capitalize GGV transport type', function(assert) {
  assert.expect(1);
  var order_transport_with_ggv = this.subject({ transportType: "ggv" });
  assert.equal(order_transport_with_ggv.get('type'), "GGV");
});

test('type returns capitalize self transport type', function(assert) {
  assert.expect(1);
  var order_transport_with_self = this.subject({ transportType: "self" });
  assert.equal(order_transport_with_self.get('type'), "Self");
});
