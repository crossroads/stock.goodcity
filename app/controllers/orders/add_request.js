import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "../../mixins/async";
const { getOwner } = Ember;

export default Ember.Controller.extend(AsyncMixin, {
  queryParams: ["orderId", "packageTypeId"],
  packageTypeId: null,
  orderId: null,
  quantity: 1,
  messageBox: Ember.inject.service(),

  description: Ember.computed("parentCodeName", {
    get() {
      return this.get("parentCodeName");
    },
    set(key, value) {
      return value;
    }
  }),

  parentCodeName: Ember.computed("packageTypeId", function() {
    var selected = "";
    var codeId = this.get("packageTypeId");
    if (codeId.length) {
      selected = this.get("store").peekRecord("code", codeId);
      return selected && selected.get("name");
    }
    return selected;
  }),

  getRequestParams() {
    var quantity = this.get("quantity");
    var description = this.get("description");
    var params = {
      quantity: quantity,
      description: description,
      package_type_id: this.get("packageTypeId"),
      order_id: this.get("orderId")
    };
    return { goodcity_request: params };
  },

  isOnline() {
    if (!window.navigator.onLine) {
      this.get("messageBox").alert(this.get("intl").t("offline_error"));
      return false;
    }
    return true;
  },

  back() {
    Ember.run(() => window.history.back());
  },

  actions: {
    clearDescription() {
      this.set("description", "");
    },

    saveRequest() {
      if (
        !this.isOnline() ||
        this.get("quantity")
          .toString()
          .trim().length === 0
      ) {
        return false;
      }

      this.runTask(async () => {
        const data = await new AjaxPromise(
          "/goodcity_requests",
          "POST",
          this.get("session.authToken"),
          this.getRequestParams()
        );
        this.get("store").pushPayload(data);
        this.back();
      }, ERROR_STRATEGIES.MODAL);
    },

    cancelRequest() {
      this.get("messageBox").custom(
        "Are you sure you want to cancel this request?",
        "Yes",
        () => {
          this.replaceRoute("orders.requested_items", this.get("orderId"));
        },
        "No"
      );
    }
  }
});
