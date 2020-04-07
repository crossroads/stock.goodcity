import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  inventoryNumber: "",
  newItemRequest: "",
  isSearchCodePreviousRoute: Ember.computed.localStorage(), // @TODO: fix
  transitionFrom: "",
  packageService: Ember.inject.service(),
  printerService: Ember.inject.service(),
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  queryParams: {
    codeId: {
      replace: true
    },
    locationId: {
      replace: true
    },
    scanLocationName: {
      replace: true
    },
    storageType: {
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
      ["computer", "electrical", "computer_accessory", "medical"].indexOf(
        selectedSubform
      ) >= 0
    );
  },

  afterModel() {
    this.store.findAll("location", {
      reload: true
    });
  },

  setupPrinterId(controller) {
    let allAvailablePrinters = this.get(
      "printerService"
    ).allAvailablePrinters();
    let user = this.get("session.loggedInUser");
    if (user.get("printerId")) {
      controller.set("selectedPrinterId", user.get("printerId"));
    } else {
      let firstPrinterId = allAvailablePrinters[0].id;
      this.get("printerService").updateUserDefaultPrinter(firstPrinterId);
      controller.set("selectedPrinterId", firstPrinterId);
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    const store = this.get("store");
    this.initializeController();

    if (this.get("newItemRequest")) {
      this.initializeAttributes();
      this.manageSubformDetails();
      this.setUpPackageImage();
    }
    this.setupPrinterId(controller);
  },

  async initializeController() {
    const controller = this.controller;
    if (!controller.get("inventoryNumber")) {
      await controller.send("autoGenerateInventoryNumber");
    }
    controller.set("invalidLocation", false);
    controller.set("invalidScanResult", false);
    controller.set("labels", 1);
    controller.set("offersLists", []);
  },

  async manageSubformDetails() {
    const controller = this.controller;
    const store = this.store;
    let codeId = controller.get("codeId");
    if (!codeId) return;
    let selected = store.peekRecord("code", codeId);
    if (!selected) return;
    let selectedSubform = selected.get("subform");
    if (!selectedSubform) return;
    if (this.isSubformAllowed(selectedSubform)) {
      controller.set("showAdditionalFields", true);
      let details = await store.query(selectedSubform, {
        distinct: "brand"
      });
      controller.set("packageDetails", details);
    } else {
      controller.set("showAdditionalFields", false);
    }
  },

  async setUpPackageImage() {
    const controller = this.controller;
    const imageKey = controller.get("imageKeys");
    if (imageKey) {
      let image = this.get("packageService").getCloudinaryImage(imageKey);
      image = await (image ||
        this.store.createRecord("image", {
          cloudinaryId: imageKey,
          favourite: true
        }));
      controller.set("newUploadedImage", image);
    } else {
      controller.set("newUploadedImage", null);
    }
  },

  initializeAttributes() {
    const controller = this.controller;
    this.set("newItemRequest", false);
    controller.set("quantity", 1);
    controller.set("caseNumber", "");
    controller.set("length", null);
    controller.set("width", null);
    controller.set("height", null);
    controller.set("weight", null);
    controller.set("pieces", null);
    controller.set("selectedGrade", {
      name: "B",
      id: "B"
    });
    controller.set("imageKeys", "");
    this.setupPrinterId(controller);
  }
});
