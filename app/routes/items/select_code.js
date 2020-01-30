import { hash } from "rsvp";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    var item = this.store.peekRecord("item", params.item_id);
    return hash({
      item: item || this.store.findRecord("item", params.item_id),
      codes: this.store.query("code", { stock: true })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("item", model.item);
    controller.set("searchText", "");
  },

  renderTemplate: function(controller) {
    this.render("search_code", { controller: controller });
  }
});
