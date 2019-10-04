import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  partialDispatchBackLinkpath: Ember.computed.localStorage(),

  queryParams: {
    orderPackageId: null
  },

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if (previousRoute) {
      var routeName = previousRoute.name;
      var backLinkPath = "items.detail";

      if (routeName === "items") {
        backLinkPath = "items.index";
      } else if (
        routeName === "items.partial_undesignate" ||
        routeName === "orders.detail"
      ) {
        backLinkPath = routeName;
      }

      this.set("partialDispatchBackLinkpath", backLinkPath);
    }
  },

  model(params) {
    return (
      this.store.peekRecord("item", params.item_id) ||
      this.store.findRecord("item", params.item_id)
    );
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set(
      "partialDispatchBackLinkpath",
      this.get("partialDispatchBackLinkpath")
    );
  }
});
