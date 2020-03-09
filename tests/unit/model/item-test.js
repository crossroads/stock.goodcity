import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("item", "Item Model", {
  needs: [
    "model:package_type",
    "model:item",
    "model:designation",
    "model:location",
    "model:code",
    "model:donor_condition",
    "model:set_item",
    "model:packages_location",
    "model:orders_package",
    "model:image",
    "model:detail",
    "model:storage_type",
    "model:offers_package",
    "model:offer"
  ]
});

test("check attributes", function(assert) {
  assert.expect(18);
  var model = this.subject();
  var notes = Object.keys(model.toJSON()).indexOf("notes") > -1;
  var grade = Object.keys(model.toJSON()).indexOf("grade") > -1;
  var inventoryNumber =
    Object.keys(model.toJSON()).indexOf("inventoryNumber") > -1;
  var caseNumber = Object.keys(model.toJSON()).indexOf("caseNumber") > -1;
  var onHandQuantity =
    Object.keys(model.toJSON()).indexOf("onHandQuantity") > -1;
  var designatedQuantity =
    Object.keys(model.toJSON()).indexOf("designatedQuantity") > -1;
  var dispatchedQuantity =
    Object.keys(model.toJSON()).indexOf("dispatchedQuantity") > -1;
  var availableQuantity =
    Object.keys(model.toJSON()).indexOf("availableQuantity") > -1;
  var receivedQuantity =
    Object.keys(model.toJSON()).indexOf("receivedQuantity") > -1;
  var length = Object.keys(model.toJSON()).indexOf("length") > -1;
  var width = Object.keys(model.toJSON()).indexOf("width") > -1;
  var height = Object.keys(model.toJSON()).indexOf("height") > -1;
  var sentOn = Object.keys(model.toJSON()).indexOf("sentOn") > -1;
  var isSet = Object.keys(model.toJSON()).indexOf("isSet") > -1;
  var hasBoxPallet = Object.keys(model.toJSON()).indexOf("hasBoxPallet") > -1;
  var itemId = Object.keys(model.toJSON()).indexOf("itemId") > -1;
  var allowWebPublish =
    Object.keys(model.toJSON()).indexOf("allowWebPublish") > -1;
  var packageType = Object.keys(model.toJSON()).indexOf("packageType") > -1;

  assert.ok(notes);
  assert.ok(grade);
  assert.ok(inventoryNumber);
  assert.ok(caseNumber);
  assert.ok(designatedQuantity);
  assert.ok(onHandQuantity);
  assert.ok(dispatchedQuantity);
  assert.ok(availableQuantity);
  assert.ok(receivedQuantity);
  assert.ok(length);
  assert.ok(width);
  assert.ok(height);
  assert.ok(sentOn);
  assert.ok(isSet);
  assert.ok(hasBoxPallet);
  assert.ok(itemId);
  assert.ok(allowWebPublish);
  assert.ok(packageType);
});

test("Relationships with other models", function(assert) {
  assert.expect(16);
  var Item = this.store().modelFor("item");
  var relationshipWithDesignation = Ember.get(Item, "relationshipsByName").get(
    "designation"
  );
  var relationshipWithLocation = Ember.get(Item, "relationshipsByName").get(
    "location"
  );
  var relationshipWithCode = Ember.get(Item, "relationshipsByName").get("code");
  var relationshipWithDonorCondition = Ember.get(
    Item,
    "relationshipsByName"
  ).get("donorCondition");
  var relationshipWithSetItem = Ember.get(Item, "relationshipsByName").get(
    "setItem"
  );
  var relationshipWithPkgsLocation = Ember.get(Item, "relationshipsByName").get(
    "packagesLocations"
  );
  var relationshipWithOrdersPkgs = Ember.get(Item, "relationshipsByName").get(
    "ordersPackages"
  );
  var relationshipWithImage = Ember.get(Item, "relationshipsByName").get(
    "images"
  );

  assert.equal(relationshipWithDesignation.key, "designation");
  assert.equal(relationshipWithDesignation.kind, "belongsTo");

  assert.equal(relationshipWithLocation.key, "location");
  assert.equal(relationshipWithLocation.kind, "belongsTo");

  assert.equal(relationshipWithCode.key, "code");
  assert.equal(relationshipWithCode.kind, "belongsTo");

  assert.equal(relationshipWithDonorCondition.key, "donorCondition");
  assert.equal(relationshipWithDonorCondition.kind, "belongsTo");

  assert.equal(relationshipWithSetItem.key, "setItem");
  assert.equal(relationshipWithSetItem.kind, "belongsTo");

  assert.equal(relationshipWithPkgsLocation.key, "packagesLocations");
  assert.equal(relationshipWithPkgsLocation.kind, "hasMany");

  assert.equal(relationshipWithOrdersPkgs.key, "ordersPackages");
  assert.equal(relationshipWithOrdersPkgs.kind, "hasMany");

  assert.equal(relationshipWithImage.key, "images");
  assert.equal(relationshipWithImage.kind, "hasMany");
});

test("check validUndispatchedLocations computed property", function(assert) {
  assert.expect(2);
  var model,
    store,
    location1,
    location2,
    packageLocation1,
    packageLocation2,
    validUndispatchedLocationsIds;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    location1 = store.createRecord("location", {
      id: 1,
      building: "11",
      area: "A"
    });
    location2 = store.createRecord("location", {
      id: 2,
      building: "Dispatched",
      area: "B"
    });
    packageLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1,
      locationId: 1
    });
    packageLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2,
      locationId: 2
    });
    model
      .get("packagesLocations")
      .pushObjects([packageLocation1, packageLocation2]);
  });

  validUndispatchedLocationsIds = model
    .get("validUndispatchedLocations")
    .getEach("id");
  assert.equal(validUndispatchedLocationsIds.get("length"), 1);
  assert.equal(
    Ember.compare(validUndispatchedLocationsIds, [packageLocation1.get("id")]),
    0
  );
});

test("check validPackagesLocations computed property", function(assert) {
  var model,
    store,
    location1,
    location2,
    location3,
    packageLocation1,
    packageLocation2,
    packageLocation3,
    validPackagesLocationsIds;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    location1 = store.createRecord("location", {
      id: 1,
      building: "11",
      area: "A"
    });
    location2 = store.createRecord("location", {
      id: 2,
      building: "Dispatched",
      area: "B"
    });
    location3 = store.createRecord("location", {
      id: 3,
      building: "33",
      area: "C"
    });
    packageLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1,
      locationId: 1
    });
    packageLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2,
      locationId: 2
    });
    packageLocation3 = store.createRecord("packagesLocation", {
      id: 3,
      locationId: 3
    });
    model
      .get("packagesLocations")
      .pushObjects([packageLocation1, packageLocation2, packageLocation3]);
  });

  validPackagesLocationsIds = model.get("validPackagesLocations").getEach("id");
  assert.equal(validPackagesLocationsIds.get("length"), 2);
});

test("check orderPackagesMoreThenZeroQty computed property", function(assert) {
  var model,
    store,
    ordersPackage1,
    ordersPackage2,
    ordersPackage3,
    orderPackagesMoreThenZeroQtyIds;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "designated",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "designated",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "designated",
      quantity: 0
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  orderPackagesMoreThenZeroQtyIds = model
    .get("orderPackagesMoreThenZeroQty")
    .getEach("id");
  assert.equal(orderPackagesMoreThenZeroQtyIds.get("length"), 2);
});

test("check cancelledItemCount computed property", function(assert) {
  var model, store, ordersPackage1, ordersPackage2, ordersPackage3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "cancelled",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "cancelled",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "designated",
      quantity: 3
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  assert.equal(model.get("cancelledItemCount"), 3);
});

test("check desinatedAndDisaptchedItemPackages computed property", function(assert) {
  var model, store, ordersPackage1, ordersPackage2, ordersPackage3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "designated",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "dispatched",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "cancelled",
      quantity: 3
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  assert.equal(model.get("desinatedAndDisaptchedItemPackages"), 2);
});

test("check hasSingleDesignation computed property", function(assert) {
  var model, store, ordersPackage1, ordersPackage2, ordersPackage3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "designated",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "dispatched",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "cancelled",
      quantity: 3
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  assert.equal(model.get("hasSingleDesignation"), true);
});

test("check hasOneDispatchedPackage computed property", function(assert) {
  var model, store, ordersPackage1, ordersPackage2, ordersPackage3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "designated",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "dispatched",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "cancelled",
      quantity: 3
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  assert.equal(model.get("hasOneDispatchedPackage"), ordersPackage2);
});

test("check ordersPackagesWithStateDesignatedAndDispatched computed property", function(assert) {
  var model, store, ordersPackage1, ordersPackage2, ordersPackage3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    ordersPackage1 = store.createRecord("ordersPackage", {
      id: 1,
      state: "designated",
      quantity: 1
    });
    ordersPackage2 = store.createRecord("ordersPackage", {
      id: 2,
      state: "dispatched",
      quantity: 2
    });
    ordersPackage3 = store.createRecord("ordersPackage", {
      id: 3,
      state: "cancelled",
      quantity: 3
    });
    model
      .get("ordersPackages")
      .pushObjects([ordersPackage1, ordersPackage2, ordersPackage3]);
  });

  assert.equal(
    Ember.compare(model.get("ordersPackagesWithStateDesignatedAndDispatched"), [
      ordersPackage1,
      ordersPackage2
    ]),
    0
  );
});

test("check hasSingleAndDispatchLocation computed property", function(assert) {
  var model,
    store,
    location1,
    location2,
    location3,
    packageLocation1,
    packageLocation2,
    packageLocation3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    location1 = store.createRecord("location", {
      id: 1,
      building: "11",
      area: "A"
    });
    location2 = store.createRecord("location", {
      id: 2,
      building: "Dispatched",
      area: "B"
    });
    location3 = store.createRecord("location", {
      id: 3,
      building: "33",
      area: "C"
    });
    packageLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1,
      locationId: 1
    });
    packageLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2,
      locationId: 2
    });
    packageLocation3 = store.createRecord("packagesLocation", {
      id: 3,
      locationId: 3
    });
    model
      .get("packagesLocations")
      .pushObjects([packageLocation1, packageLocation2, packageLocation3]);
  });

  assert.equal(model.get("hasSingleAndDispatchLocation"), false);
});

test("check firstLocationName computed property", function(assert) {
  var model,
    store,
    location1,
    location2,
    location3,
    packageLocation1,
    packageLocation2,
    packageLocation3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    location1 = store.createRecord("location", {
      id: 1,
      building: "11",
      area: "A"
    });
    location2 = store.createRecord("location", {
      id: 2,
      building: "Dispatched",
      area: "B"
    });
    location3 = store.createRecord("location", {
      id: 3,
      building: "33",
      area: "C"
    });
    packageLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1,
      location: location1
    });
    packageLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2,
      location: location2
    });
    packageLocation3 = store.createRecord("packagesLocation", {
      id: 3,
      quantity: 2,
      location: location3
    });
    model
      .get("packagesLocations")
      .pushObjects([packageLocation1, packageLocation2, packageLocation3]);
  });

  assert.equal(model.get("firstLocationName"), "11-A");
});

test("check packagesLocationsList computed property", function(assert) {
  var model,
    store,
    location1,
    location2,
    location3,
    packageLocation1,
    packageLocation2,
    packageLocation3;
  model = this.subject();
  store = this.store();

  Ember.run(function() {
    location1 = store.createRecord("location", {
      id: 1,
      building: "11",
      area: "A"
    });
    location2 = store.createRecord("location", {
      id: 2,
      building: "25",
      area: "B"
    });
    location3 = store.createRecord("location", {
      id: 3,
      building: "33",
      area: "C"
    });
    packageLocation1 = store.createRecord("packagesLocation", {
      id: 1,
      quantity: 1,
      location: location1
    });
    packageLocation2 = store.createRecord("packagesLocation", {
      id: 2,
      quantity: 2,
      location: location2
    });
    packageLocation3 = store.createRecord("packagesLocation", {
      id: 3,
      quantity: 2,
      location: location3
    });
    model
      .get("packagesLocations")
      .pushObjects([packageLocation1, packageLocation2, packageLocation3]);
  });

  assert.equal(
    Ember.compare(model.get("packagesLocationsList"), [
      packageLocation1,
      packageLocation2,
      packageLocation3
    ]),
    0
  );
});

test("check imageUrlList computed property", function(assert) {
  var model, store, image1, image2, item;
  model = this.subject();
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
    image1 = store.createRecord("image", {
      id: 1,
      cloudinary_id: "1416902230/mmguhm3zdkonc2nynjue.jpg",
      favourite: false,
      itemId: 1
    });
    image2 = store.createRecord("image", {
      id: 2,
      cloudinary_id: "1416902232/mmguhm3zdkonc2nynjue2.jpg",
      favourite: false
    });
  });

  assert.equal(
    Ember.compare(item.get("imageUrlList"), [
      "https://res.cloudinary.com/ddoadcjjl/image/upload/c_fit,fl_progressive/v1438323573/default/test_image.jpg"
    ]),
    0
  );
});

test("setImages: returns associated items imageUrlList", function(assert) {
  var store, item, setItem;

  store = this.store();

  Ember.run(function() {
    setItem = store.createRecord("setItem", { id: 1, description: "abc" });
    item = store.createRecord("item", {
      id: 1,
      quantity: 2,
      imageUrlList: [
        "https://res.cloudinary.com/ddoadcjjl/image/upload/c_fit,fl_progressive/v1438323573/default/test_image.jpg"
      ],
      setItem: setItem
    });
  });

  assert.equal(item.get("setImages").get("length"), 1);
  assert.equal(
    Ember.compare(item.get("setImages"), [
      "https://res.cloudinary.com/ddoadcjjl/image/upload/c_fit,fl_progressive/v1438323573/default/test_image.jpg"
    ]),
    0
  );
});
