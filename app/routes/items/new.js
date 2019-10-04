import AuthorizeRoute from "./../authorize";
import AjaxPromise from "stock/utils/ajax-promise";
import Ember from "ember";

export default AuthorizeRoute.extend({
  inventoryNumber: "",
  newItemRequest: "",
  isSearchCodePreviousRoute: Ember.computed.localStorage(),
  isSelectLocationPreviousRoute: Ember.computed.localStorage(),

  packageService: Ember.inject.service(),

  queryParams: {
    codeId: {
      replace: true
    },
    locationId: {
      replace: true
    },
    scanLocationName: {
      replace: true
    }
  },

  beforeModel() {
    this._super(...arguments);
    var searchCodePreviousRoute = this.get("isSearchCodePreviousRoute");

    if (searchCodePreviousRoute) {
      var newItemRequest = searchCodePreviousRoute ? true : false;
      this.set("newItemRequest", newItemRequest);
    } else {
      this.replaceWith("search_code");
    }
  },

  model() {
    if (
      !this.controller ||
      !this.controller.get("inventoryNumber") ||
      !this.inventoryNumber
    ) {
      return this.get("packageService")
        .generateInventoryNumber()
        .then(data => {
          this.set("inventoryNumber", data.inventory_number);
        });
    }
  },

  afterModel() {
    this.store.findAll("location", {
      reload: true
    });
  },

  async setupController(controller, model) {
    this._super(controller, model);
    controller.set("inventoryNumber", this.get("inventoryNumber"));
    controller.set("displayInventoryOptions", false);
    controller.set("autoGenerateInventory", true);
    controller.set("inputInventory", false);
    controller.set("invalidLocation", false);
    controller.set("invalidScanResult", false);
    controller.set("labels", 1);
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
        controller.set("selectedGrade", {
          name: "B",
          id: "B"
        });
        controller.set("selectedCondition", {
          name: "Used",
          id: "U"
        });
        controller.set("imageKeys", "");
      }
      var imageKey = controller.get("imageKeys");
      let codeId = controller.get("codeId");
      if (codeId) {
        let selected = this.get("store").peekRecord("code", codeId);
        if (selected) {
          if (
            ["computer", "electrical", "computer_accessory"].indexOf(
              selected.get("subform")
            ) >= 0
          ) {
            controller.set("showAdditionalFields", true);
            let details = await this.store.findAll(selected.get("subform"));
            let country = await this.store.findAll("country");
            console.log(country, "hit");
            controller.set("packageDetails", details);
          }
        }
      }
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
