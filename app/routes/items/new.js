import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({

  inventoryNumber: "",
  newItemRequest: "",

  queryParams: {
    codeId: "",
    locationId: "",
    scanLocationName: ""
  },

  beforeModel() {
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    if(previousRoute) {
      var newItemRequest = previousRoute.name === "search_code" ? true : false;
      this.set("newItemRequest", newItemRequest);
    } else {
      this.transitionTo("search_code");
    }
  },

  model() {
    var _this = this;
    return new AjaxPromise("/inventory_numbers", "POST", this.get('session.authToken'))
      .then(function(data) {
        _this.set("inventoryNumber", data.inventory_number);
      });
  },

  afterModel() {
    this.store.findAll('location', {reload: true});
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('inventoryNumber', this.get('inventoryNumber'));
    controller.set('displayInventoryOptions', false);
    controller.set('autoGenerateInventory', true);
    controller.set('inputInventory', false);
    controller.set('invalidLocation', false);
    controller.set('invalidScanResult', false);

    if(this.get("newItemRequest")) {
      this.set("newItemRequest", false);
      controller.set('caseNumber', "");
      controller.set('quantity', 1);
      controller.set('length', null);
      controller.set('width', null);
      controller.set('height', null);
      controller.set('description', "");
      controller.set('selectedGrade', { name: "B", id: "B" });
      controller.set('selectedCondition', { name: "Used", id: "U" });
    }
  }

});
