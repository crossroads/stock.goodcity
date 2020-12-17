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
import { stub } from "../helpers/stub";

let App, pkg, designationService, locationService, destLocation;

module("Acceptance: Item details tabs", {
  beforeEach: function() {
    App = startApp({}, 2);

    designationService = App.__container__.lookup("service:designationService");
    locationService = App.__container__.lookup("service:locationService");

    stub(designationService, "execAction");
    stub(locationService, "movePackage");

    MockUtils.startSession();
    MockUtils.mockEmptyPreload();
    MockUtils.mockUserProfile();
    MockUtils.mockOrderSummary();
    MockUtils.mockDonorConditions();
    MockUtils.mockEmpty("process_checklist");
    MockUtils.mockEmpty("purpose");
    MockUtils.mockEmpty("processing_destination");

    let location = FactoryGuy.make("location");
    let location2 = FactoryGuy.make("location");
    let designation = FactoryGuy.make("designation");
    let bookingType = FactoryGuy.make("booking_type");

    destLocation = location2;
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
      locationId: location.get("id"),
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
      json: {
        locations: [location, location2].map(l => l.toJSON({ includeId: true }))
      }
    });
    mockFindAll("packages_location").returns({
      json: {
        packages_locations: [packagesLocation.toJSON({ includeId: true })]
      }
    });
    $.mockjax({
      url: "/api/v1/packages/" + pkg.get("id") + "/parent_container*",
      type: "GET",
      status: 200,
      responseText: {
        items: []
      }
    });
    $.mockjax({
      url: "/api/v1/stockit_item*",
      type: "GET",
      status: 200,
      responseText: {
        items: [pkg.toJSON({ includeId: true })],
        locations: [location, location2].map(l =>
          l.toJSON({ includeId: true })
        ),
        packages_locations: [packagesLocation.toJSON({ includeId: true })],
        orders_packages: [ordersPackage.toJSON({ includeId: true })]
      }
    });

    $.mockjax({
      url: "/api/v1/packages/package_valuation*",
      type: "GET",
      status: 200,
      responseText: {
        items: []
      }
    });

    mockFindAll("restriction").returns({
      json: { restrictions: [] }
    });

    mockFindAll("item").returns({
      json: { items: [pkg.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    mockFindAll("message").returns({
      json: {
        messages: []
      }
    });
    mockFindAll("package_type").returns({
      json: {
        package_types: []
      }
    });
    mockFindAll("cancellation_reason").returns({
      json: {
        cancellation_reason: []
      }
    });

    visit("/");
    andThen(function() {
      visit("items/" + pkg.id);
    });
  },
  afterEach: function() {
    designationService.execAction.restore();
    locationService.movePackage.restore();
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
  andThen(() => {
    click(".item_details_screen .tab-container .tab.location");
  });

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
    const dataRow = $(".locations .content-row:not(.italic)");
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

test("Location tab: moving the package", function(assert) {
  click(".item_details_screen .tab-container .tab.location");

  const overlayIsOpen = () => {
    return $("#location-search-overlay .popup-overlay").hasClass("open");
  };

  andThen(() => {
    const moveButton = $(".content-row:not(.italic) .move-button");
    const pkgLocation = pkg.get("packagesLocations.firstObject");
    const location = pkgLocation.get("location");

    assert.equal(moveButton.length, 1); // only one location
    assert.equal(overlayIsOpen(), false);

    andThen(() => click(moveButton));

    andThen(() => {
      assert.equal(overlayIsOpen(), true);
      click($("#location-search-overlay .list-activity .row").last());
    });

    andThen(() => {
      const moveModal = $(".move-confirmation");

      assert.equal(overlayIsOpen(), false);
      assert.equal(moveModal.length, 1);

      const moveButton = moveModal
        .find(".button")
        .toArray()
        .filter(b => $(b).text() == "Move");
      click(moveButton);
    });

    andThen(() => {
      assert.equal(locationService.movePackage.invocations.length, 1);

      const args = locationService.movePackage.invocations[0];

      assert.equal(args[0], pkg);
      assert.equal(args[1]["from"], location);
      assert.equal(args[1]["to"], destLocation);
      assert.equal(args[1]["quantity"], 1);
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
      assert.equal(ordersPackagesBLocks.length, 2);

      const actions = ordersPackagesBLocks.find(".action-drawer .action");
      assert.equal(actions.length, 2);
      assert.equal(
        actions
          .eq(0)
          .text()
          .trim(),
        "Cancel"
      );

      const actionsRan = () => {
        return designationService.execAction.invocations.map(args => args[1]);
      };

      Ember.run(() => {
        assert.equal(actionsRan().length, 0);
        actions.eq(0).click();
        Ember.run.next(() => {
          assert.equal(actionsRan().length, 1);
          assert.equal(actionsRan()[0], "cancel");
        });
      });
    });
  });
});

test("Dispatching orders_packages blocks calls the correct designationService action", function(assert) {
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
      assert.equal(ordersPackagesBLocks.length, 2);

      const actions = ordersPackagesBLocks.find(".action-drawer .action");
      assert.equal(actions.length, 2);
      assert.equal(
        actions
          .eq(1)
          .text()
          .trim(),
        "Dispatch"
      );

      const actionsRan = () => {
        return designationService.execAction.invocations.map(args => args[1]);
      };

      assert.equal(actionsRan().length, 0);
      Ember.run(() => actions.eq(1).click());

      andThen(() => {
        Ember.run.later(() => {
          Ember.run.scheduleOnce("afterRender", () => {
            const openPopup = ordersPackagesBLocks.find(".popup-overlay.open");
            assert.equal(openPopup.length, 1);

            const dispatchButton = openPopup.find(".button:last-child");
            assert.equal(
              /^Dispatch \(\d+\)/.test(dispatchButton.text().trim()),
              true
            );

            click(dispatchButton);

            andThen(() => {
              assert.equal(actionsRan().length, 1);
              assert.equal(actionsRan()[0], "dispatch");
            });
          });
        });
      });
    });
  });
});
