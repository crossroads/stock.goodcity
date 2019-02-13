import getOrderRoute from './get_order';

export default getOrderRoute.extend({
  currentRouteName: null,

  beforeModel() {
    this.set("currentRouteName", this.routeName);
  },

  afterModel(model) {
    const currentRoute = this.get("currentRouteName");
    if(currentRoute && currentRoute === "orders.summary") {
      this.transitionTo("orders.contact_summary", model.id);
    }
  }
});
