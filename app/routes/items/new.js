import AuthorizeRoute from "./../authorize";
import AjaxPromise from "stock/utils/ajax-promise";
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

  async setupController(controller, model) {
    this._super(controller, model);
    const store = this.get("store");
    if (!controller.get("inventoryNumber")) {
      controller.send("autoGenerateInventoryNumber");
    }
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
        controller.set("imageKeys", "");
      }
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

      var imageKey = controller.get("imageKeys");
      if (
        imageKey &&
        imageKey.length &&
        window.localStorage.isSelectLocationPreviousRoute === "true"
      ) {
        var image = store
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
      window.localStorage.setItem("isSelectLocationPreviousRoute", false);
    }
  }
});
