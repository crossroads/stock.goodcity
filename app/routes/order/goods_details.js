import orderUserOrganisation from "./order_user_organisation";

export default orderUserOrganisation.extend({
  model(params) {
    return this.loadIfAbsent("designation", params.order_id);
  },

  setupController(controller, model) {
    const user = model.get("createdBy");
    const organisation = user.get(
      "organisationsUsers.firstObject.organisation"
    );
    const orderUserOrganisation = {
      orderUserOrganisation: { user, organisation, order: model }
    };
    controller.set("model", orderUserOrganisation);
    this.setupGoods(controller, model);
  },

  setupGoods(controller, model) {
    const goodcityRequests = [];
    if (!model.get("goodcityRequests").length) {
      goodcityRequests.push({
        description: null,
        quantity: 1,
        code: null
      });
    } else {
      model.get("goodcityRequests").map(gr => {
        goodcityRequests.push({
          id: gr.get("id"),
          description: gr.get("description"),
          quantity: gr.get("quantity"),
          code: gr.get("code")
        });
      });
    }
    controller.set("goodcityRequests", goodcityRequests);
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
