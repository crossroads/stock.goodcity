import $ from "jquery";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import AutoResizableTextarea from "./auto-resize-textarea";
import AjaxPromise from "stock/utils/ajax-promise";

export default AutoResizableTextarea.extend({
  previousValue: "",
  store: service(),
  order: null,
  orderCopy: readOnly("order"),

  keyDown() {
    var value = this.element.value;
    if (value.charCodeAt(value.length - 1) === 10 && event.which === 13) {
      return false;
    }
  },

  didInsertElement() {
    $(".description-textarea").val(
      this.get("orderCopy.data.purposeDescription")
    );
  },

  focusOut() {
    var order = this.get("order");
    var url = `/orders/${order.get("id")}`;
    var key = this.get("name");
    var value = this.attrs.value.value || "";
    var orderParams = {};
    orderParams[key] = this.get("value").trim() || "";
    var element = this.element;

    if (
      orderParams[key].toString() !==
        this.get("previousValue")
          .toString()
          .trim() &&
      value !== ""
    ) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        order: orderParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
          $(element)
            .siblings()
            .hide();
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    this.element.value = value.trim();
    if (this.element.value === "") {
      this.$().focus();
      $(this.element)
        .siblings()
        .show();
      return false;
    }
    $(this.element).removeClass("item-description-textarea");
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    $(this.element).addClass("item-description-textarea");
  },

  click() {
    this.addCssStyle();
  }
});
