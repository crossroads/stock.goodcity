import getOrderRoute from "./get_order";

export default getOrderRoute.extend({
  queryParams: {
    searchInput: ""
  },

  setupController(controller, model) {
    this._super(controller, model);
    if (this.paramsFor("orders.items").searchInput) {
      controller.set("searchText", this.paramsFor("orders.items").searchInput);
    }
  },

  resetController(controller) {
    controller.hideResults();
  }
});
