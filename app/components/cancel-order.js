import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default Component.extend({
  tagName: "a",
  isCancel: true,
  messageBox: service(),
  store: service(),
  order: null,

  actions: {
    deleteOrder() {
      const previousPath = this.get("prevPath");
      if (previousPath && previousPath === "contact_summary") {
        this.get("router").transitionTo(
          "orders.contact_summary",
          this.get("order.id")
        );
      } else {
        this.get("messageBox").custom(
          "Cancel this Request?",
          "Not Now",
          null,
          "Cancel Request",
          () => this.send("removeOrder")
        );
      }
    },

    removeOrder() {
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      let orderId = this.get("order.id");
      let url = `/orders/${orderId}`;
      let designation = this.get("store").peekRecord("designation", orderId);

      new AjaxPromise(url, "DELETE", this.get("session.authToken"))
        .then(() => {
          this.get("router").transitionTo("app_menu_list");
          this.get("store").unloadRecord(designation);
        })
        .finally(() => loadingView.destroy());
    }
  }
});
