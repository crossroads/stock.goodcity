import Ember from "ember";
import singletonItemDispatchToGcOrder from "../mixins/singleton_item_dispatch_to_gc_order";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.Component.extend(singletonItemDispatchToGcOrder, {
  hidden: true,
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  actions: {
    designateCancelledItemPopUp(ordersPacakgeId, orderId) {
      var order = this.get("store").peekRecord("designation", orderId);
      if (
        !order.get("allDesignatedOrdersPackages") &&
        order.get("isCancelled")
      ) {
        this.get("messageBox").custom(
          this.get("i18n").t("order_details.cancel_item_designate_warning"),
          this.get("i18n").t("designate.designate"),
          () => {
            this.send("apiCancelOrderRequests", ordersPacakgeId, orderId);
          },
          this.get("i18n").t("not_now")
        );
      } else {
        this.send("confirmationPopUp", ordersPacakgeId, orderId);
      }
    },

    confirmationPopUp(ordersPacakgeId, orderId) {
      this.get("messageBox").custom(
        this.get("i18n").t("designate.redesignate"),
        this.get("i18n").t("designate.designate"),
        () => {
          this.send(
            "designateCancelledOrdersPacakge",
            ordersPacakgeId,
            orderId
          );
        },
        this.get("i18n").t("not_now")
      );
    },

    apiCancelOrderRequests(ordersPacakgeId, orderId) {
      this.send("changeOrderState", orderId, "redesignate_cancelled_order");
      this.send("designateCancelledOrdersPacakge", ordersPacakgeId, orderId);
    },

    designateCancelledOrdersPacakge(ordersPacakgeId, orderId) {
      var ordersPackage = this.get("store").peekRecord(
        "orders_package",
        ordersPacakgeId
      );
      var item = ordersPackage.get("item");
      var properties = {
        order_id: orderId,
        package_id: item.get("id"),
        quantity: item.get("quantity"),
        state: "cancelled",
        cancelled_orders_package_id: ordersPacakgeId
      };
      var url = `/items/${item.get(
        "id"
      )}/update_partial_quantity_of_same_designation`;

      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: properties
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .catch(error => {
          if (error.status === 422) {
            var errors = Ember.$.parseJSON(error.responseText).errors;
            this.get("messageBox").alert(errors);
          }
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    changeOrderState(orderId, transition) {
      var url = `/orders/${orderId}/transition`;
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        transition: transition
      }).then(data => {
        data["designation"] = data["order"];
        this.get("store").pushPayload(data);
      });
    },

    toggle(value) {
      this.set("hidden", value);
      var item = this.get("item");
      var itemOptionsLink = Ember.$(".options-link-open." + item.id)[0];
      if (itemOptionsLink) {
        Ember.$(".receive-item-options." + item.id).toggleClass("hidden");
        Ember.$(".options-link-open." + item.id).toggleClass("hidden");
        return false;
      } else {
        return true;
      }
    }
  }
});
