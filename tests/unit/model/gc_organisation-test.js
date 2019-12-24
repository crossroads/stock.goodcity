import { get } from "@ember/object";
import { run } from "@ember/runloop";
import { test, moduleForModel } from "ember-qunit";
import FactoryGuy from "ember-data-factory-guy";
import startApp from "../../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";

var App;

moduleForModel("gc_organisation", "GcOrganisation model", {
  needs: ["model:organisations_user", "model:designation"],

  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
  },
  afterEach: function() {
    run(function() {
      TestHelper.teardown();
    });
    run(App, "destroy");
  }
});

test("check attributes", function(assert) {
  assert.expect(6);

  var model = this.subject();

  var nameEn = Object.keys(model.toJSON()).indexOf("nameEn") > -1;
  var nameZhTw = Object.keys(model.toJSON()).indexOf("nameZhTw") > -1;
  var descriptionEn = Object.keys(model.toJSON()).indexOf("descriptionEn") > -1;
  var descriptionZhTw =
    Object.keys(model.toJSON()).indexOf("descriptionZhTw") > -1;
  var website = Object.keys(model.toJSON()).indexOf("website") > -1;
  var registration = Object.keys(model.toJSON()).indexOf("registration") > -1;

  assert.ok(nameEn);
  assert.ok(nameZhTw);
  assert.ok(descriptionEn);
  assert.ok(descriptionZhTw);
  assert.ok(website);
  assert.ok(registration);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);

  var gc_organisation = this.store().modelFor("gc_organisation");

  var relationshipWithContact = get(gc_organisation, "relationshipsByName").get(
    "organisationsUsers"
  );

  assert.equal(relationshipWithContact.key, "organisationsUsers");
  assert.equal(relationshipWithContact.kind, "hasMany");
});

test("ordersCount returns total order count associated with organisation", function(assert) {
  var orders = FactoryGuy.makeList("designation", 2);

  var model = this.subject({ designations: orders });

  assert.equal(model.get("ordersCount"), 2);
});
