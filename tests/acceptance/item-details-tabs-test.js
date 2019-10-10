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

let App, pkg, designationService, execAction, actionsRan;

module("Acceptance: Item details tabs", {
  beforeEach: function() {
    App = startApp({}, 2);

    actionsRan = [];
    designationService = App.__container__.lookup("service:designationService");
    execAction = designationService.execAction;
    designationService.execAction = async (_, name) => {
      actionsRan.push(name);
    };

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
      packageId: pkg.get("id"),
      quantity: 1
    });
    let ordersPackage = FactoryGuy.make("orders_package", {
      packageId: pkg.get("id"),
      item: pkg,
      designationId: designation.get("id"),
      orderId: designation.get("id"),
      orderId: designation.get("id"),
      designation: designation,
      allowedActions: [
        { name: "cancel", enabled: true },
        { name: "dispatch", enabled: true }
      ]
    });
    mockFindAll("orders_package").returns({
      json: { orders_packages: [ordersPackage.toJSON({ includeId: true })] }
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
        packages_locations: [packagesLocation.toJSON({ includeId: true })],
        orders_packages: [ordersPackage.toJSON({ includeId: true })]
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
    designationService.execAction = execAction; // restore
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

test("Publishing tab orders_packages blocks", function(assert) {
  assert.equal(currentPath(), "items.detail.info");

  click(".item_details_screen .tab-container .tab.publishing");

  andThen(() => {
    assert.equal(
      $(".gc-orders-package-block .content-wrapper .content").hasClass(
        "closed"
      ),
      true
    );

    click(".gc-orders-package-block .arrow-icon-holder");

    andThen(() => {
      assert.equal(
        $(".gc-orders-package-block .content-wrapper .content").hasClass(
          "closed"
        ),
        false
      );

      const ordersPackagesBLocks = $(".gc-orders-package-block");
      assert.equal(ordersPackagesBLocks.length, 1);

      const actions = ordersPackagesBLocks.find(".action-drawer .action");
      assert.equal(actions.length, 2);
      assert.equal(
        actions
          .eq(0)
          .text()
          .trim(),
        "Cancel"
      );
      assert.equal(
        actions
          .eq(1)
          .text()
          .trim(),
        "Dispatch"
      );

      Ember.run(() => {
        assert.equal(actionsRan.length, 0);
        actions.eq(0).click();
        Ember.run.next(() => {
          assert.equal(actionsRan.length, 1);
          assert.equal(actionsRan[0], "cancel");
          actions.eq(1).click();
          Ember.run.later(() => {
            assert.equal(actionsRan.length, 2);
            assert.equal(actionsRan[0], "cancel");
            assert.equal(actionsRan[1], "dispatch");
          });
        });
      });
    });
  });
});
