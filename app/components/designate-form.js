import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import _ from "lodash";
const { getOwner } = Ember;
import config from "../config/environment";

export default Ember.Component.extend({
  displayUserPrompt: false,
  displayAlertOverlay: false,
  showAllSetItems: false,
  autoDisplayOverlay: false,
  hideDetailsLink: true,
  showDispatchOverlay: false,
  partial_quantity: 0,
  partiallyDesignatedPopUp: false,
  designatedSetOrdersPackages: [],
  partialDesignatedConfirmationPopUp: false,
  reDesignateDispatchAlertPopUp: false,
  totalPartialDesignatedItems: 0,
  designatedRecord: null,
  designateFullSet: Ember.computed.localStorage(),
  env: config.APP.environment,
  dispatchedItemOrder: "",

  order: null,
  item: null,
  toggleOverlay: null,
  isSet: null,
  store: Ember.inject.service(),
  intl: Ember.inject.service(),
  designatedOnce: true,
  orderPackageId: null,
  alreadyShown: true,
  hasCancelledState: false,
  messageBox: Ember.inject.service(),

  returnsDesignateFullSet: Ember.computed("item.setItem.items", function() {
    if (this.get("env") === "test") {
      return false;
    }
    if (window.localStorage.getItem("designateFullSet") === null) {
      window.localStorage.setItem("designateFullSet", false);
    }
    return !window.localStorage.getItem("designateFullSet").includes(false);
  }),

  overridesDesignation: Ember.computed(
    "item.setItem.designationList.[]",
    "order",
    function() {
      if (this.get("item.isSet")) {
        var list = [];
        this.get("item.setItem.items")
          .rejectBy("designation", null)
          .forEach(item => {
            list.push(item.get("designation.code"));
          });
        list.filter((e, i, list) => {
          i = list.indexOf(e) === i;
        });

        if (list.length === 0) {
          return false;
        } else {
          var index = list.indexOf(this.get("order.code"));
          if (index > -1) {
            list.splice(index, 1);
          }
          return list.length > 0;
        }
      } else {
        return false;
      }
    }
  ),

  triggerOrderClick: Ember.observer("order", "toggleOverlay", function() {
    this.set("hasCancelledState", false);
    this.set(
      "partial_quantity",
      getOwner(this)
        .lookup("controller:items.search_order")
        .get("partial_qty")
    );
    if (
      this.get("order") &&
      getOwner(this)
        .lookup("controller:items.detail")
        .get("callOrderObserver")
    ) {
      this.send("displayDesignateOverlay");
      Ember.$(".popupOverlay #messageBox").addClass("makeScrollable");
    }
  }),

  isDesignatedToCurrentOrder: Ember.computed("order", "item", function() {
    return this.get("order.items").findBy("id", this.get("item.id"));
  }),

  triggerItemClick: Ember.observer("autoDisplayOverlay", function() {
    if (this.get("autoDisplayOverlay")) {
      this.send("displayDesignateOverlay");
    }
  }),

  cancelledState: Ember.computed("order", "item", function() {
    this.set("hasCancelledState", false);
    var item = this.get("item");
    var order = this.get("order");
    this.get("store")
      .peekAll("orders_package")
      .filterBy("itemId", parseInt(item.id, 10))
      .forEach(record => {
        if (
          record.get("itemId") === parseInt(item.id, 10) &&
          record.get("designationId") === parseInt(order.id, 10)
        ) {
          if (record.get("state") === "cancelled") {
            this.set("hasCancelledState", true);
          }
          this.set("orderPackageId", record.get("id"));
        }
      });
    return this.get("hasCancelledState");
  }),

  isDesignatedToCurrentPartialOrder: Ember.computed(
    "order",
    "item",
    function() {
      var total = 0;
      var alreadyPartiallyDesignated = false;
      this.set("partiallyDesignatedPopUp", false);
      this.set("partialDesignatedConfirmationPopUp", false);
      this.set("hasCancelledState", false);
      var order = this.get("order");
      var item = this.get("item");
      var designatedSetOrdersPackages = [];
      if (item.get("isSet")) {
        item.get("setItem.items").forEach(pkg => {
          pkg.get("ordersPackages").forEach(record => {
            if (
              record.get("state") !== "cancelled" &&
              record.get("itemId") === parseInt(item.id, 10) &&
              record.get("designationId") === parseInt(order.id, 10)
            ) {
              alreadyPartiallyDesignated = true;
              this.set("orderPackageId", record.get("id"));
              designatedSetOrdersPackages.push(record);
              if (!this.get("designateFullSet")) {
                this.set("designatedRecord", record);
                this.set("totalPartialDesignatedItems", record.get("quantity"));
              }
            }
          });
        });
        this.set("designatedSetOrdersPackages", designatedSetOrdersPackages);
        return alreadyPartiallyDesignated;
      } else {
        this.get("store")
          .peekAll("orders_package")
          .filterBy("itemId", parseInt(item.id, 10))
          .forEach(record => {
            if (
              record.get("quantity") &&
              record.get("itemId") === parseInt(item.id, 10) &&
              record.get("designationId") === parseInt(order.id, 10)
            ) {
              total += record.get("quantity");
              this.set("designatedRecord", record);
              alreadyPartiallyDesignated = true;
              this.set("orderPackageId", record.get("id"));
            }
          });
        this.set("totalPartialDesignatedItems", total);
        return alreadyPartiallyDesignated;
      }
    }
  ),

  isDispatched: Ember.computed("order", "item", function() {
    let item = this.get("item");
    if (item.get("hasOneDispatchedPackage")) {
      this.set("dispatchedItemOrder", item.get("designation"));
      return true;
    }
  }),

  designationDetails: Ember.computed("item", function() {
    let item = this.get("item");
    let itemStatus = {};
    return {
      status: item.get("designationId") ? "Re-designate" : "Designating",
      orderId: item.get("designationId"),
      orderCode: item.get("orderCode")
    };
  }),

  itemDesignateParams() {
    let order = this.get("order");
    let item = this.get("item");
    let ordersPackage = item.get("firstDesignatedOrdersPackage");
    return {
      order_id: order.get("id"),
      package_id: item.get("id"),
      quantity: ordersPackage
        ? ordersPackage.get("quantity")
        : item.get("quantity"),
      orders_package_id: ordersPackage ? ordersPackage.id : null //id of previous OrdersPackage ie to be cancelled
    };
  },

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

  isSameDesignationOrCancelledState() {
    return (
      this.get("order.ordersPackages")
        .getEach("itemId")
        .includes(parseInt(this.get("item.id"))) && this.get("cancelledState")
    );
  },

  updatePartialQuantityOfSameDesignation() {
    const item = this.get("item");
    const url = `/items/${item.get(
      "id"
    )}/update_partial_quantity_of_same_designation`;
    const props = _.extend(this.itemDesignateParams(), {
      state: "cancelled",
      cancelled_orders_package_id: this.get("orderPackageId")
    });

    return this._ajaxUpdate(url, {
      package: props
    });
  },

  partialItemDesignate() {
    const item = this.get("item");
    const url = `/items/${item.get("id")}/designate_partial_item`;
    const props = this.itemDesignateParams();

    return this._ajaxUpdate(url, {
      package: props
    });
  },

  _ajaxUpdate(url, params) {
    const order = this.get("order");
    this.showLoadingSpinner();
    return new AjaxPromise(url, "PUT", this.get("session.authToken"), params)
      .then(responseData => {
        this.get("store").pushPayload(responseData);
        this.exit(() => this.get("router").replaceWith("orders.detail", order));
      })
      .catch(xhr => {
        if (xhr.status === 422) {
          this.get("messageBox").alert(xhr.responseJSON.errors);
        }
      })
      .finally(() => {
        this.hideLoadingSpinner();
      });
  },

  exit(fallbackBehaviour) {
    this.getWithDefault("navigationAction", fallbackBehaviour)();
  },

  actions: {
    displayDesignateOverlay() {
      this.set("partiallyDesignatedPopUp", false);
      this.set("partialDesignatedConfirmationPopUp", false);
      this.set("reDesignateDispatchAlertPopUp", false);

      if (
        this.get("partial_quantity") &&
        this.get("isDesignatedToCurrentPartialOrder")
      ) {
        if (this.get("designatedOnce") && !this.get("cancelledState")) {
          this.set("partiallyDesignatedPopUp", true);
          return true;
        } else if (this.get("designatedOnce")) {
          this.set("partialDesignatedConfirmationPopUp", true);
          return true;
        }
      } else if (this.get("partial_quantity")) {
        if (this.get("designatedOnce")) {
          this.set("partialDesignatedConfirmationPopUp", true);
          return true;
        }
      } else if (this.get("isDispatched")) {
        this.set("reDesignateDispatchAlertPopUp", true);
      } else {
        this.set("displayUserPrompt", true);
      }
    },

    designateItem() {
      this.set("showAllSetItems", false);
      if (this.isSameDesignationOrCancelledState()) {
        this.updatePartialQuantityOfSameDesignation();
      } else {
        this.partialItemDesignate();
      }
    },

    designatePartialItem() {
      this.set("designatedOnce", false);
      var order = this.get("order");
      const orderId = order.get("id");
      var item = this.get("item");
      var showAllSetItems = this.get("showAllSetItems");
      this.set("showAllSetItems", false);
      var isSameDesignation =
        this.get("partial_quantity") &&
        this.get("isDesignatedToCurrentPartialOrder");
      this.showLoadingSpinner();
      var url;
      var properties = {
        order_id: orderId,
        package_id: item.get("id"),
        quantity: this.get("partial_quantity")
      };

      if (item.get("isSet") && this.get("designateFullSet")) {
        url = `/items/${item.get("setItem.id")}/designate_stockit_item_set`;
      } else if (isSameDesignation || this.get("cancelledState")) {
        properties.state = "cancelled";
        properties.cancelled_orders_package_id = this.get("orderPackageId");
        url = `/items/${item.get(
          "id"
        )}/update_partial_quantity_of_same_designation`;
      } else {
        url = `/items/${item.get("id")}/designate_partial_item`;
      }

      if (isSameDesignation) {
        properties.operation = "update";
        properties.orders_package_id = this.get("orderPackageId");
      }

      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: properties
      })
        .then(data => {
          this.get("store").pushPayload(data);
          if (item.get("isSet")) {
            this.exit(() => this.get("router").replaceWith("items.index"));
          } else if (showAllSetItems) {
            this.sendAction("displaySetItems");
          } else {
            this.hideLoadingSpinner();
            this.exit(() =>
              this.get("router").replaceWith("orders.active_items", orderId)
            );
          }
        })
        .catch(error => {
          if (error.status === 422) {
            var errors = Ember.$.parseJSON(error.responseText).errors;
            this.get("messageBox").alert(errors, () => {
              this.exit(() => this.get("router").replaceWith("items.index"));
            });
          }
        })
        .finally(() => {
          this.hideLoadingSpinner();
        });
    }
  }
});
