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
  receivedQuantity: attr("number"),
  length: attr("number"),
  width: attr("number"),
  height: attr("number"),
  weight: attr("number"),
  pieces: attr("number"),
  packageTypeId: attr("number"),
  offerId: attr("number"),
  expiryDate: attr("date"),

  onHandQuantity: attr("number"),
  availableQuantity: attr("number"),
  designatedQuantity: attr("number"),
  dispatchedQuantity: attr("number"),

  // Temporarily keep the old `quantity` field as an alias to make migration easier
  quantity: Ember.computed.alias("availableQuantity"),

  sentOn: attr("date"),
  isSet: attr("boolean"),
  hasBoxPallet: attr("boolean"),
  itemId: attr("string"),
  allowWebPublish: attr("boolean"),
  saleable: attr("boolean"),
  detailId: attr("number"),
  detailType: attr("string"),
  detail: belongsTo("detail", {
    polymorphic: true,
    async: false
  }),
  designationId: attr("string"),
  designation: belongsTo("designation", {
    async: false
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
    async: false
  }),
  itemActions: hasMany("item_action", {
    async: false
  }),

  storageTypeId: attr("number"),
  storageType: belongsTo("storage_type", {
    async: true
  }),

  ordersPackages: hasMany("ordersPackages", {
    async: false
  }),
  ordersPackages: hasMany("ordersPackages", { async: true }),
  offersPackages: hasMany("offersPackages", { async: false }),
  offer: belongsTo("offer", { async: false }),
  imageIds: attr(),
  images: hasMany("image", {
    async: true
  }),

  isDispatched: Ember.computed.bool("sentOn"),
  orderCode: Ember.computed.alias("designation.code"),
  updatedAt: attr("date"),

  imageUrl: Ember.computed.alias("image.imageUrl"),

  storageTypeName: Ember.computed.alias("storageType.name"),

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

  isAvailable: Ember.computed.bool("availableQuantity"),

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
