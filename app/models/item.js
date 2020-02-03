import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import Ember from "ember";
import cloudinaryUrl from "./cloudinary_url";

function SUM(ordersPkgs) {
  return ordersPkgs.mapBy("quantity").reduce((total, qty) => total + qty, 0);
}

/**
 * @module Models/Item
 * @description maps to the 'Package' table
 * @augments ember/Model
 *
 */
export default cloudinaryUrl.extend({
  notes: attr("string"),
  grade: attr("string"),
  inventoryNumber: attr("string"),
  caseNumber: attr("string"),
  quantity: attr("number"),
  receivedQuantity: attr("number"),
  inHandQuantity: attr("number"),
  length: attr("number"),
  width: attr("number"),
  height: attr("number"),
  weight: attr("number"),
  pieces: attr("number"),
  packageTypeId: attr("number"),

  sentOn: attr("date"),
  isSet: attr("boolean"),
  hasBoxPallet: attr("boolean"),
  itemId: attr("string"),
  allowWebPublish: attr("boolean"),

  detailId: attr("number"),
  detailType: attr("string"),
  detail: belongsTo("detail", {
    polymorphic: true,
    async: false
  }),
  designationId: attr("string"),
  designation: belongsTo("designation", {
    async: true
  }),
  location: belongsTo("location", {
    async: false
  }),
  code: belongsTo("code", {
    async: false
  }),
  packageType: belongsTo("packageType", {
    async: false
  }),
  donorCondition: belongsTo("donor_condition", {
    async: false
  }),
  setItem: belongsTo("set_item", {
    async: false
  }),
  packagesLocations: hasMany("packages_location", {
    async: true
  }),

  storageTypeId: attr("number"),
  storageType: belongsTo("storage_type", {
    async: true
  }),

  ordersPackages: hasMany("ordersPackages", {
    async: true
  }),
  imageIds: attr(),
  images: hasMany("image", {
    async: true
  }),

  isDispatched: Ember.computed.bool("sentOn"),
  orderCode: Ember.computed.alias("designation.code"),
  updatedAt: attr("date"),

  imageUrl: Ember.computed.alias("image.imageUrl"),
  designateFullSet: Ember.computed.localStorage(),

  storageTypeName: Ember.computed("storageTypeId", function() {
    return this.get("storageType.name");
  }),

  isDesignated: Ember.computed(
    "ordersPackages",
    "ordersPackages.[]",
    "ordersPackages.@each.state",
    function() {
      // Warning: this assumes all items are singletones
      return (
        this.get("ordersPackages")
          .filterBy("state", "designated")
          .get("length") > 0
      );
    }
  ),

  isDispatchedForQuantity: Ember.computed("ordersPackages.[]", function() {
    return this.get("ordersPackages").isAny("state", "dispatched");
  }),

  firstDesignatedOrdersPackage: Ember.computed(
    "designatedOrdersPackages",
    function() {
      return this.get("designatedOrdersPackages").get("firstObject");
    }
  ),

  lockedQty: Ember.computed(
    "ordersPackages",
    "ordersPackages.[]",
    "ordersPackages.@each.state",
    function() {
      return SUM(this.get("ordersPackages").rejectBy("state", "cancelled"));
    }
  ),

  availableQty: Ember.computed("lockedQty", "receivedQuantity", function() {
    return this.get("receivedQuantity") - this.get("lockedQty");
  }),

  isAvailable: Ember.computed("availableQty", function() {
    return this.get("availableQty") > 0;
  }),

  isUnavailable: Ember.computed.not("isAvailable"),

  thumbImageUrl: Ember.computed(
    "favouriteImage.{angle,cloudinaryId}",
    function() {
      return (
        this.get("favouriteImage.thumbImageUrl") ||
        this.generateUrl(120, 120, true)
      );
    }
  ),

  validUndispatchedLocations: Ember.computed(
    "packagesLocations.@each.quantity",
    function() {
      var dispatchedLocation = this.store
        .peekAll("location")
        .filterBy("building", "Dispatched");
      var pkgsLocations = this.get("packagesLocations").filterBy("quantity");
      if (dispatchedLocation.length) {
        return pkgsLocations.rejectBy(
          "locationId",
          parseInt(dispatchedLocation.get("firstObject.id"), 10)
        );
      } else {
        return pkgsLocations;
      }
    }
  ),

  validPackagesLocations: Ember.computed(
    "packagesLocations.@each.quantity",
    function() {
      return this.get("packagesLocations").filterBy("quantity");
    }
  ),

  orderPackagesMoreThenZeroQty: Ember.computed(
    "ordersPackages.@each.quantity",
    function() {
      return this.get("ordersPackages")
        .filterBy("quantity")
        .filterBy("state", "designated");
    }
  ),

  onHandQty: Ember.computed(
    "receivedQuantity",
    "dispatchedQuantity",
    function() {
      return this.get("receivedQuantity") - this.get("dispatchedQuantity");
    }
  ),

  designatedItemCount: Ember.computed(
    "ordersPackages.@each.quantity",
    "ordersPackages.[]",
    function() {
      return this.get("ordersPackages").filterBy("state", "designated").length;
    }
  ),

  designatedOrdersPackages: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      return this.get("ordersPackages")
        .filterBy("state", "designated")
        .filterBy("quantity");
    }
  ),

  dispatchedOrdersPackages: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      return this.get("ordersPackages")
        .filterBy("state", "dispatched")
        .filterBy("quantity");
    }
  ),

  dispatchedQuantity: Ember.computed(
    "ordersPackages.@each.quantity",
    function() {
      return SUM(this.get("ordersPackages").filterBy("state", "dispatched"));
    }
  ),

  cancelledItemCount: Ember.computed(
    "ordersPackages.@each.quantity",
    function() {
      return SUM(this.get("ordersPackages").filterBy("state", "cancelled"));
    }
  ),

  favouriteImage: Ember.computed("images.@each.favourite", function() {
    return (
      this.get("images")
        .filterBy("favourite", true)
        .get("firstObject") ||
      this.store
        .peekAll("image")
        .filterBy("itemId", parseInt(this.id, 10))
        .filterBy("favourite", true)
        .get("firstObject")
    );
  }),

  desinatedAndDisaptchedItemPackages: Ember.computed(
    "ordersPackages.[]",
    function() {
      return this.get("ordersPackagesWithStateDesignatedAndDispatched.length");
    }
  ),

  hasOneDesignatedPackage: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      var designatedOrdersPackages = this.get("ordersPackages").filterBy(
        "state",
        "designated"
      );
      return designatedOrdersPackages.get("length") > 1 ||
        designatedOrdersPackages.get("length") === 0
        ? false
        : designatedOrdersPackages[0];
    }
  ),

  hasSingleDesignation: Ember.computed("orderPackages.[]", function() {
    return (
      this.get("ordersPackages")
        .filterBy("state", "designated")
        .get("length") === 1
    );
  }),

  totalDispatchedQty: Ember.computed("ordersPackages.@each.state", function() {
    var totalDispatchedQty = 0;
    var dispatchedOrdersPackages = this.get("ordersPackages").filterBy(
      "state",
      "dispatched"
    );
    dispatchedOrdersPackages.forEach(record => {
      totalDispatchedQty += parseInt(record.get("quantity"), 10);
    });
    return totalDispatchedQty;
  }),

  totalDesignatedQty: Ember.computed("ordersPackages.@each.state", function() {
    var totalDesignatedQty = 0;
    var designatedOrdersPackages = this.get("ordersPackages").filterBy(
      "state",
      "designated"
    );
    designatedOrdersPackages.forEach(record => {
      totalDesignatedQty += parseInt(record.get("quantity"), 10);
    });
    return totalDesignatedQty;
  }),

  hasOneDispatchedPackage: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      var dispatchedOrdersPackages = this.get("ordersPackages").filterBy(
        "state",
        "dispatched"
      );
      return dispatchedOrdersPackages.get("length") > 1 ||
        dispatchedOrdersPackages.get("length") === 0
        ? false
        : dispatchedOrdersPackages[0];
    }
  ),

  hasAllPackagesDispatched: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      return this.packagesByState("dispatched");
    }
  ),

  packagesByState(state) {
    var received_quantity = this.get("receivedQuantity");
    var ordersPackages = this.get("ordersPackages").filterBy("state", state);
    var totalQty = ordersPackages.reduce(
      (qty, record) => qty + parseInt(record.get("quantity"), 10),
      0
    );

    return totalQty === received_quantity;
  },

  hasAllPackagesDesignated: Ember.computed(
    "ordersPackages.@each.state",
    function() {
      return this.packagesByState("designated");
    }
  ),

  ordersPackagesWithStateDesignatedAndDispatched: Ember.computed(
    "ordersPackages.[]",
    function() {
      var orderPackages = this.get("ordersPackages").filterBy("quantity");
      orderPackages.forEach(record => {
        if (record && record.get("state") === "cancelled") {
          orderPackages.removeObject(record);
        }
      });
      return orderPackages;
    }
  ),

  minSetQty: Ember.computed("setItem.items", function() {
    if (this.get("isSet") && this.get("designateFullSet")) {
      var setItems = this.get("setItem.items");
      var minQty = setItems.canonicalState[0]._data.quantity;
      setItems.canonicalState.forEach(record => {
        var qty = record._data.quantity;
        if (qty < minQty) {
          minQty = qty;
        }
      });
      return minQty;
    }
  }),

  isSingletonItem: Ember.computed("quantity", function() {
    return this.get("receivedQuantity") === 1;
  }),

  isMultiQtyItem: Ember.computed.not("isSingletonItem"),

  hasSingleLocation: Ember.computed(
    "packagesLocations.[]",
    "packagesLocationsList",
    function() {
      return Ember.isEqual(this.get("packagesLocationsList").length, 1);
    }
  ),

  hasSingleAndDispatchLocation: Ember.computed(
    "packagesLocations.[]",
    "packagesLocations",
    function() {
      var pkgLocations = this.get("packagesLocations");
      return (
        Ember.isEqual(pkgLocations.length, 1) &&
        !this.get("hasAllPackagesDispatched")
      );
    }
  ),

  hasMultiLocations: Ember.computed("packagesLocations.[]", function() {
    return this.get("packagesLocations.length") > 1;
  }),

  firstAllLocationName: Ember.computed(
    "packagesLocations.@each.location",
    "packagesLocations.[]",
    "packagesLocations",
    function() {
      return this.get("packagesLocations").get("firstObject.location.name");
    }
  ),

  firstLocationName: Ember.computed(
    "packagesLocations.[]",
    "packagesLocationsList",
    function() {
      return this.get("packagesLocationsList").get("firstObject.location.name");
    }
  ),

  firstOrdersPackage: Ember.computed("ordersPackages.[]", function() {
    return this.get("ordersPackages.firstObject");
  }),

  locations: Ember.computed(
    "packagesLocations.[]",
    "packagesLocations.@each.location",
    function() {
      return this.get("packagesLocations").mapBy("location");
    }
  ),

  packagesLocationsList: Ember.computed(
    "packagesLocations.[]",
    "packagesLocations.@each.location",
    function() {
      return this.get("packagesLocations")
        .rejectBy("location.building", "Dispatched")
        .uniq();
    }
  ),

  imageUrlList: Ember.computed(
    "images",
    "setItem.@each.items.images.[]",
    "setItem.@each.items.@each.imageUrl",
    "setItem.@each.items.@each.thumbImageUrl",
    function() {
      var imageList = [];
      this.store
        .peekAll("image")
        .filterBy("itemId", parseInt(this.id, 10))
        .forEach(image => imageList.pushObject(image.get("imageUrl")));
      return imageList.uniq();
    }
  ),

  setImages: Ember.computed(
    "images",
    "setItem.items.@each.imageUrlList.[]",
    "setItem.items.@each.images.[]",
    "setItem.items.@each.imageUrl",
    "setItem.items.@each.thumbImageUrl",
    function() {
      var setItemImages = [];
      this.get("setItem.items").forEach(item => {
        setItemImages = setItemImages.concat(item.get("imageUrlList"));
      });
      return setItemImages.uniq();
    }
  ),

  allowLabelPrint: Ember.computed("ordersPackages.[]", function() {
    return !this.get("isDispatchedForQuantity") && !this.get("isSet");
  }),

  /**
   * @instance
   * @property {Item[]} siblings the other packages that are part of the same set
   */
  siblings: Ember.computed("isSet", "setItems.items.[]", function() {
    if (!this.get("isSet")) {
      return [];
    }

    return this.get("setItem.items").rejectBy("id", this.get("id"));
  })
});
