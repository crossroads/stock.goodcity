import AuthorizeRoute from "./../authorize";
import AjaxPromise from "stock/utils/ajax-promise";
import Ember from "ember";

export default AuthorizeRoute.extend({
  inventoryNumber: "",
  newItemRequest: "",
  isSearchCodePreviousRoute: Ember.computed.localStorage(),
  isSelectLocationPreviousRoute: Ember.computed.localStorage(),

  queryParams: {
    codeId: "",
    locationId: "",
    scanLocationName: ""
  },

  beforeModel() {
    this._super(...arguments);
    var searchCodePreviousRoute = this.get("isSearchCodePreviousRoute");
    if (searchCodePreviousRoute) {
      var newItemRequest = searchCodePreviousRoute ? true : false;
      this.set("newItemRequest", newItemRequest);
    } else {
      this.transitionTo("search_code");
    }
  },

  model() {
    var _this = this;
    if (
      !this.controller ||
      !this.controller.get("inventoryNumber") ||
      !this.inventoryNumber
    ) {
      return new AjaxPromise(
        "/inventory_numbers",
        "POST",
        this.get("session.authToken")
      ).then(function(data) {
        _this.set("inventoryNumber", data.inventory_number);
      });
    }
  },

  afterModel() {
    this.store.findAll("location", { reload: true });
  },

  setupController(controller, model) {
    this._super(controller, model);

    controller.set("inventoryNumber", this.get("inventoryNumber"));
    controller.set("displayInventoryOptions", false);
    controller.set("autoGenerateInventory", true);
    controller.set("inputInventory", false);
    controller.set("invalidLocation", false);
    controller.set("invalidScanResult", false);

    if (this.get("newItemRequest")) {
      this.set("newItemRequest", false);
      controller.set("quantity", 1);
      if (
        window.localStorage.getItem("isSelectLocationPreviousRoute") === "false"
      ) {
        controller.set("caseNumber", "");
        controller.set("length", null);
        controller.set("width", null);
        controller.set("height", null);
        controller.set("selectedGrade", { name: "B", id: "B" });
        controller.set("selectedCondition", { name: "Used", id: "U" });
        controller.set("imageKeys", "");
      }
      var imageKey = controller.get("imageKeys");
      if (
        imageKey &&
        imageKey.length &&
        window.localStorage.isSelectLocationPreviousRoute === "true"
      ) {
        var image = this.get("store")
          .peekAll("image")
          .filterBy("cloudinaryId", imageKey)
          .get("firstObject");
        image =
          image ||
          this.get("store").createRecord("image", {
            cloudinaryId: imageKey,
            favourite: true
          });
        controller.set("newUploadedImage", image);
      } else {
        controller.set("newUploadedImage", null);
      }
      window.localStorage.setItem("isSelectLocationPreviousRoute", false);
    }
  }
});
