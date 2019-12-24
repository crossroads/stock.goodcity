import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.Component.extend({
  displayUserPrompt: false,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  intl: Ember.inject.service(),
  hideDetailsLink: true,
  selectedOrder: null,
  item: null,
  toggleOverlay: true,
  order: null,
  autoDisplayOverlay: false,

  triggerClick: Ember.observer("autoDisplayOverlay", function() {
    this.send("displayDispatchOverlay");
  }),

  actions: {
    displayDispatchOverlay() {
      this.set("displayUserPrompt", true);
    },

    assignDesignation() {
      var selection = this.get("selectedOrder");
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      if (!selection) {
        return false;
      }
      var order = this.get("store").peekRecord("designation", selection);
      this.set("order", order);
      this.toggleProperty("toggleOverlay");
      var properties = {
        set_item_id: this.get("item.setItem.id"),
        order_id: order.get("id")
      };

      var url = `/items/${this.get(
        "item.setItem.id"
      )}/update_designation_of_set`;

      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: properties
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          this.get("router").transitionTo("items.index");
        });
    },

    dispatchItemSet() {
      var item = this.get("item");
      var order = item.get("designation.id");
      var url = `/items/${item.get("setItem.id")}/dispatch_stockit_item_set`;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var properties = {
        order_id: order,
        package_id: item.get("id")
      };

      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: properties
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
