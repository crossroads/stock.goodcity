import AuthorizeRoute from "./../authorize";
import Ember from "ember";
import GradeMixin from "stock/mixins/grades_option";

export default AuthorizeRoute.extend(GradeMixin, {
  inventoryNumber: "",
  newItemRequest: "",
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

  beforeModel({ queryParams = {} }) {
    this._super(...arguments);

    const hasCodeId = !!queryParams.codeId;

    if (!hasCodeId) {
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

  async afterModel() {
    const reload = true;
    const storageType = this.paramsFor("items.new").storageType;
    await this.store.findAll("location", { reload });
    if (["Box", "Pallet"].indexOf(storageType) < 0) {
      await Ember.RSVP.all([
        this.store.findAll("restriction", { reload }),
        this.store.findAll("donor_condition", { reload })
      ]);
    }
  },

  setupPrinterId(controller) {
    let defaultPrinter = this.get("printerService").getDefaultPrinter();
    if (defaultPrinter) {
      controller.set("selectedPrinterId", defaultPrinter.id);
    } else {
      let allAvailablePrinters = this.get(
        "printerService"
      ).allAvailablePrinters();
      if (allAvailablePrinters.length) {
        let firstPrinterId = allAvailablePrinters[0].id;
        this.get("printerService").addDefaultPrinter(firstPrinterId);
        controller.set("selectedPrinterId", firstPrinterId);
      }
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    const storageType = this.paramsFor("items.new").storageType;
    const isBoxPallet = ["Box", "Pallet"].indexOf(storageType) > -1;
    this.initializeController();
    this.initializeAttributes(isBoxPallet, controller);
    if (!isBoxPallet) {
      this.manageSubformDetails();
    }
    this.setUpPackageImage();
    this.setupPrinterId(controller);
  },

  async initializeController() {
    const controller = this.controller;
    controller.set("showAdditionalFields", false);
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

  getDefaultCondition() {
    const conditions = this.get("store").peekAll("donor_condition");
    return (
      conditions.filterBy("name", "Lightly Used").get("firstObject") ||
      conditions.get("firstObject")
    );
  },

  async initializeAttributes(isBoxPallet, controller) {
    this.set("newItemRequest", false);
    controller.set("quantity", 1);
    controller.set("caseNumber", "");
    controller.set("length", null);
    controller.set("width", null);
    controller.set("height", null);
    controller.set("weight", null);
    controller.set("pieces", null);
    controller.set("expiry_date", null);
    controller.set("imageKeys", "");
    controller.set("defaultCondition", null);
    controller.set("valueHkDollar", null);
    controller.set("defaultValueHkDollar", null);
    controller.set("restrictionId", null);
    controller.set("saleableId", null);
    controller.set("selectedGrade", { id: null });

    if (!isBoxPallet) {
      this.assignPackageAttribute(controller);
    }
  },

  async assignPackageAttribute(controller) {
    controller.set(
      "restrictionId",
      this.get("restrictionOptions").get("firstObject")
    );
    controller.set(
      "saleableId",
      this.get("saleableOptions").get("firstObject")
    );
    controller.set("selectedGrade", {
      name: "B",
      id: "B"
    });
    const defaultValue = await this.get("packageService").getItemValuation({
      donorConditionId: this.getDefaultCondition().id,
      grade: controller.get("selectedGrade").id,
      packageTypeId: controller.get("codeId")
    });

    controller.set("defaultCondition", this.getDefaultCondition());
    controller.set("valueHkDollar", defaultValue.value_hk_dollar);
    controller.set("defaultValueHkDollar", defaultValue.value_hk_dollar);
  }
});
