import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  inventoryNumber: "",
  newItemRequest: "",
  isSearchCodePreviousRoute: Ember.computed.localStorage(),
  isSelectLocationPreviousRoute: Ember.computed.localStorage(),
  transitionFrom: "",

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
    var currentRouteName = this.controllerFor("application").get(
      "currentRouteName"
    );
    var transitionFrom = this.modelFor(currentRouteName);
    if (transitionFrom) {
      this.set("transitionFrom", transitionFrom.modelName);
    }
    if (searchCodePreviousRoute) {
      var newItemRequest = searchCodePreviousRoute ? true : false;
      this.set("newItemRequest", newItemRequest);
    } else {
      this.replaceWith("search_code");
    }
  },

  isSubformAllowed(selectedSubform) {
    return (
      ["computer", "electrical", "computer_accessory"].indexOf(
        selectedSubform
      ) >= 0
    );
  },

  afterModel() {
    this.store.findAll("location", {
      reload: true
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    const store = this.get("store");
    this.initializeController();

    if (this.get("newItemRequest")) {
      this.initializeDimensions();
      this.manageSubformDetails();
      this.setUpPackageImage();
      window.localStorage.setItem("isSelectLocationPreviousRoute", false);
    }
  },

  initializeController() {
    const controller = this.controller;
    if (!controller.get("inventoryNumber")) {
      controller.send("autoGenerateInventoryNumber");
    }
    controller.set("invalidLocation", false);
    controller.set("invalidScanResult", false);
    controller.set("labels", 1);
  },

  async manageSubformDetails() {
    const controller = this.controller;
    const store = this.store;
    let codeId = controller.get("codeId");
    if (codeId) {
      let selected = store.peekRecord("code", codeId);
      if (selected) {
        let selectedSubform = selected.get("subform");
        if (this.isSubformAllowed(selectedSubform)) {
          controller.set("showAdditionalFields", true);
          let details = await store.query(selectedSubform, {
            distinct: "brand"
          });
          controller.set("packageDetails", details);
        } else {
          controller.set("showAdditionalFields", false);
        }
      }
    }
  },

  setUpPackageImage() {
    const controller = this.controller;
    const imageKey = controller.get("imageKeys");
    const store = this.store;
    if (
      imageKey &&
      imageKey.length &&
      window.localStorage.isSelectLocationPreviousRoute === "true"
    ) {
      let image = store
        .peekAll("image")
        .filterBy("cloudinaryId", imageKey)
        .get("firstObject");
      image =
        image ||
        store.createRecord("image", {
          cloudinaryId: imageKey,
          favourite: true
        });
      controller.set("newUploadedImage", image);
    } else {
      controller.set("newUploadedImage", null);
    }
  },

  initializeDimensions() {
    const controller = this.controller;
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
      controller.set("imageKeys", "");
    }
  }
});
