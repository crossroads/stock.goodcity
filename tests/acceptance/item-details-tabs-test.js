import Ember from "ember";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import "../factories/orders_package";
import "../factories/designation";
import "../factories/item";
import "../factories/location";
import FactoryGuy from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
import MockUtils from "../helpers/mock-utils";

let App, pkg;

module("Acceptance: Item details tabs", {
  beforeEach: function() {
    App = startApp({}, 2);

    MockUtils.startSession();
    MockUtils.mockEmptyPreload();
    MockUtils.mockUserProfile();
    MockUtils.mockOrderSummary();
    MockUtils.mockDonorConditions();
    MockUtils.mockEmpty("process_checklist");
    MockUtils.mockEmpty("purpose");

    let location = FactoryGuy.make("location");
    let designation = FactoryGuy.make("designation");
    let bookingType = FactoryGuy.make("booking_type");
    pkg = FactoryGuy.make("item", {
      id: 50,
      state: "submitted",
      quantity: 1,
      height: 10,
      width: 15,
      length: 20,
      notes: "Inline edit test",
      allowWebPublish: false
    });
    let packagesLocation = FactoryGuy.make("packages_location", {
      location: location,
      item: pkg,
      packageId: pkg.get("it"),
      quantity: 1
    });
    mockFindAll("designation").returns({
      json: { designations: [designation.toJSON({ includeId: true })] }
    });
    mockFindAll("location").returns({
      json: { locations: [location.toJSON({ includeId: true })] }
    });
    mockFindAll("packages_location").returns({
      json: {
        packages_locations: [packagesLocation.toJSON({ includeId: true })]
      }
    });
    $.mockjax({
      url: "/api/v1/stockit_item*",
      type: "GET",
      status: 200,
      responseText: {
        items: [pkg.toJSON({ includeId: true })],
        locations: [location.toJSON({ includeId: true })],
        packages_locations: [packagesLocation.toJSON({ includeId: true })]
      }
    });

    mockFindAll("item").returns({
      json: { items: [pkg.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });

    visit("/");
    andThen(function() {
      visit("items/" + pkg.id);
    });
  },
  afterEach: function() {
    MockUtils.closeSession();
    Ember.run(App, "destroy");
  }
});

test("Land on the info tab on the index", function(assert) {
  assert.equal(currentPath(), "items.detail.info");

  const selectedTab = $(".item_details_screen .tab-container .tab.selected");

  assert.equal(selectedTab.length, 1);
  assert.equal(selectedTab.text().trim(), pkg.get("inventoryNumber"));
  assert.equal(selectedTab.hasClass("info"), true);
});

test("Can navigate to the location tab", function(assert) {
  assert.equal(currentPath(), "items.detail.info");

  click(".item_details_screen .tab-container .tab.location");

  andThen(() => {
    const selectedTab = $(".item_details_screen .tab-container .tab.selected");

    assert.equal(currentPath(), "items.detail.location");
    assert.equal(selectedTab.length, 1);
    assert.equal(selectedTab.text().trim(), pkg.get("firstAllLocationName"));
    assert.equal(selectedTab.hasClass("location"), true);
  });
});

test("Deep link to the location tab", function(assert) {
  visit("items/" + pkg.id + "/location");

  andThen(() => {
    const selectedTab = $(".item_details_screen .tab-container .tab.selected");

    assert.equal(currentPath(), "items.detail.location");
    assert.equal(selectedTab.length, 1);
    assert.equal(selectedTab.text().trim(), pkg.get("firstAllLocationName"));
    assert.equal(selectedTab.hasClass("location"), true);
  });
});

test("Can navigate to the publishing tab", function(assert) {
  assert.equal(currentPath(), "items.detail.info");

  click(".item_details_screen .tab-container .tab.publishing");

  andThen(() => {
    const selectedTab = $(".item_details_screen .tab-container .tab.selected");

    assert.equal(currentPath(), "items.detail.publishing");
    assert.equal(selectedTab.length, 1);
    assert.equal(selectedTab.hasClass("publishing"), true);
  });
});

test("Deep link to the publishing tab", function(assert) {
  visit("items/" + pkg.id + "/publishing");

  andThen(() => {
    const selectedTab = $(".item_details_screen .tab-container .tab.selected");

    assert.equal(currentPath(), "items.detail.publishing");
    assert.equal(selectedTab.length, 1);
    assert.equal(selectedTab.hasClass("publishing"), true);
  });
});

test("Location tab content", function(assert) {
  click(".item_details_screen .tab-container .tab.location");

  andThen(() => {
    const dataRow = $(".content-row:not(.italic)");
    const pkgLocation = pkg.get("packagesLocations.firstObject");
    const location = pkgLocation.get("location");

    assert.equal(dataRow.length, 1); // only one location
    [
      location.get("building"),
      location.get("area"),
      pkgLocation.get("quantity")
    ].forEach((val, idx) => {
      const col = dataRow.find(`.columns:nth-child(${idx + 1})`);
      assert.equal(
        col
          .text()
          .trim()
          .replace(/\s+/g, ""),
        val.toString()
      );
    });
  });
});

test("Publishing tab content", function(assert) {
  assert.equal(currentPath(), "items.detail.info");

  click(".item_details_screen .tab-container .tab.publishing");

  andThen(() => {
    const checkbox = $(".publishing-tab .toggle-switch input[type=checkbox]");

    assert.equal(checkbox.length, 1);
    assert.equal(checkbox.prop("checked"), false);
    assert.equal(pkg.get("allowWebPublish"), false);

    checkbox.click();
    andThen(() => {
      assert.equal(checkbox.prop("checked"), true);
      assert.equal(pkg.get("allowWebPublish"), true);
    });
  });
});
