import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("packages_location", "PackagesLocation Model", {
  needs: [
    "model:item",
    "model:image",
    "model:donor_condition",
    "model:user",
    "model:designation",
    "model:code",
    "model:location",
    "model:package_set",
    "model:packages_location",
    "model:orders_package"
  ]
});

test("check attributes", function(assert) {
  assert.expect(4);
  var model = this.subject();
  var packageId = Object.keys(model.toJSON()).indexOf("packageId") > -1;
  var itemId = Object.keys(model.toJSON()).indexOf("itemId") > -1;
  var quantity = Object.keys(model.toJSON()).indexOf("quantity") > -1;
  var locationId = Object.keys(model.toJSON()).indexOf("locationId") > -1;

  assert.ok(packageId);
  assert.ok(itemId);
  assert.ok(quantity);
  assert.ok(locationId);
});

test("Relationships with other models", function(assert) {
  assert.expect(4);
  var PackagesLocation = this.store().modelFor("packages_location");
  var relationshipWithItem = Ember.get(
    PackagesLocation,
    "relationshipsByName"
  ).get("item");
  var relationshipWithLocation = Ember.get(
    PackagesLocation,
    "relationshipsByName"
  ).get("location");

  assert.equal(relationshipWithItem.key, "item");
  assert.equal(relationshipWithItem.kind, "belongsTo");
  assert.equal(relationshipWithLocation.key, "location");
  assert.equal(relationshipWithLocation.kind, "belongsTo");
});

test("Checking computed properties", function(assert) {
  assert.expect(1);
  var packages_location = this.subject({ quantity: 5 });
  assert.equal(packages_location.get("quantityToMove"), 5);
});

test("PackagesLocation is a valid ember-data Model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("packages_location", { id: 1, quantity: 5 });
    record = store.peekRecord("packages_location", 1);
  });

  assert.equal(record.get("quantity"), 5);
});

test("check siblingPackagesLocations computed property", function(assert) {
  var model, store, item, packagesLocation1, packagesLocation2;
  model = this.subject({ id: 3, quantity: 1 });
  store = this.store();

  Ember.run(function() {
    item = store.createRecord("item", {
      id: 1,
      inventoryNumber: "C4234",
      quantity: 2,
      createdAt: "12/01/2016",
      updatedAt: "12/01/2016",
      state: "submitted",
      notes: "Example",
      length: 10,
      width: 10,
      height: 10,
      allow_web_publish: false,
      receivedQuantity: 1
    });

    packagesLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1
    });
    packagesLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2
    });
    item
      .get("packagesLocations")
      .pushObjects([packagesLocation1, packagesLocation2, model]);
  });
  assert.equal(
    Ember.compare(model.get("siblingPackagesLocations").getEach("id"), [
      "1",
      "2",
      "3"
    ]),
    0
  );
});
