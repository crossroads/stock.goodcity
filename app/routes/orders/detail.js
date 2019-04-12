import getOrderRoute from "./get_order";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";

export default getOrderRoute.extend({
  orderBackLinkPath: Ember.computed.localStorage(),
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  currentRouteName: null,

  loadIfAbsent(model, id) {
    // note: using findRecord with reload:false will make a request regardless of whether the data is
    // present or not. If it is present, it will return immediatly but still proceed to making the request
    // which can result in weird race conditions later on. We use peek explicitely here to avoid this.
    return (
      this.store.peekRecord(model, id) ||
      this.store.findRecord(model, id, { reload: true })
    );
  },

  setHistoryRoute(routeName, previousRoute) {
    if (
      routeName === "items.history" ||
      routeName === "items.partial_undesignate"
    ) {
      this.set("itemIdforHistoryRoute", previousRoute.params.item_id);
    } else if (routeName === "organisations.orders") {
      this.set(
        "organisationIdforHistoryRoute",
        previousRoute.params.organisation_id
      );
    }
  },

  setPath(routeName, path) {
    if (routeName.indexOf("orders")) {
      switch (routeName) {
        case "items.search_order":
          path = "items";
          break;
        case "items.detail":
          path = path;
          break;
        default:
          path = routeName;
      }
    } else if (
      routeName.indexOf("orders") === 0 &&
      routeName !== "organisations.orders"
    ) {
      path = this.get("orderBackLinkPath") || path;
    }
    return path;
  },

  beforeModel() {
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    var path = "orders.index";
    this.set("currentRouteName", this.routeName);
    if (previousRoute) {
      var routeName = previousRoute.name;
      this.setHistoryRoute(routeName, previousRoute);
      path = this.setPath(routeName, path);
    }
    this.set("orderBackLinkPath", path);
  },

  /* jshint ignore:start */
  async model(params) {
    let _this = this;
    let result = await new AjaxPromise(
      `/orders/${params.order_id}/`,
      "GET",
      this.get("session.authToken")
    );
    Object.assign(result.designation, result.meta.counts);
    Ember.run(function() {
      _this.store.pushPayload(result);
    });
    return this.loadIfAbsent("designation", params.order_id);
  },
  /* jshint ignore:end */

  afterModel(model) {
    if (!model) {
      return;
    }

    const tasks = [
      this.store.query("orders_package", {
        search_by_order_id: model.get("id")
      })
    ];

    let organisationId = model.get("gcOrganisationId");
    if (organisationId) {
      tasks.push(this.loadIfAbsent("gcOrganisation", organisationId));
    }

    return Ember.RSVP.all(tasks);
  },

  setupController(controller, model) {
    if (model) {
      var itemId = this.get("itemIdforHistoryRoute");
      var organisation_id = this.get("organisationIdforHistoryRoute");
      if (itemId) {
        controller.set("itemIdforHistoryRoute", itemId);
      } else if (organisation_id) {
        controller.set("organisationIdforHistoryRoute", organisation_id);
      }
      this._super(controller, model);
      controller.set("backLinkPath", this.get("orderBackLinkPath"));
      var currentRoute = this.get("currentRouteName");
      if (currentRoute && currentRoute === "orders.detail") {
        this.transitionTo("orders.active_items", model.id);
      }
    }
  }
});
