import Ember from "ember";
import config from "../config/environment";

function run(func) {
  if (func) {
    func();
  }
}

export default Ember.Controller.extend({
  notifications: Ember.inject.controller(),
  socket: null,
  lastOnline: Date.now(),
  deviceTtl: 0,
  deviceId: Math.random()
    .toString()
    .substring(2),
  modelDataTypes: [
    "offer",
    "Offer",
    "item",
    "Item",
    "Schedule",
    "schedule",
    "delivery",
    "Delivery",
    "gogovan_order",
    "GogovanOrder",
    "contact",
    "Contact",
    "address",
    "Address",
    "order",
    "Order"
  ],
  // logger: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),
  status: {
    online: false
  },

  updateStatus: Ember.observer("socket", function() {
    var socket = this.get("socket");
    var online = navigator.connection
      ? navigator.connection.type !== "none"
      : navigator.onLine;
    online = socket && socket.connected && online;
    this.set("status", { online: online });
  }),

  // resync if offline longer than deviceTtl
  checkdeviceTtl: Ember.observer("status.online", function() {
    var online = this.get("status.online");
    var deviceTtl = this.get("deviceTtl");
    if (
      online &&
      deviceTtl !== 0 &&
      Date.now() - this.get("lastOnline") > deviceTtl * 1000
    ) {
      this.resync();
    } else if (online === false) {
      this.set("lastOnline", Date.now());
    }
  }),

  initController: Ember.on("init", function() {
    var updateStatus = Ember.run.bind(this, this.updateStatus);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  }),

  setFavImage(item, data, type) {
    if (type.toLowerCase() === "image" && data.operation !== "delete") {
      //we do not get item.id from api so assign package.id to item.id
      if (!item.item_id && item.package_id) {
        item.item_id = item.package_id;
      }
      if (item.favourite === true) {
        //if favourite changed than make other item.favourite false
        this.store
          .peekAll(type)
          .filterBy("itemId", item.item_id)
          .forEach(function(x) {
            if (x.id !== item.id) {
              x.set("favourite", false);
            }
          });
        var itemImage = this.store.peekRecord(type, item.id);
        if (itemImage) {
          itemImage.set("favourite", true);
        }
      }
    }
  },

  updateItemData(pkg) {
    if (pkg) {
      let item = this.store.peekRecord("item", pkg.id);
      if (item && item.get("isSingletonItem") && !pkg.designation_id) {
        if (item.get("ordersPackages.length")) {
          if (this.get("status.online")) {
            this.store.findRecord("item", item.id);
          }
        }
      }
    }
  },

  actions: {
    wire() {
      var updateStatus = Ember.run.bind(this, this.updateStatus);
      var connectUrl =
        config.APP.SOCKETIO_WEBSERVICE_URL +
        "?token=" +
        encodeURIComponent(this.session.get("authToken")) +
        "&deviceId=" +
        this.get("deviceId") +
        "&meta=appName:" +
        config.APP.NAME;
      // pass mutilple meta values by seperating '|' like this
      // "&meta=appName:" + config.APP.NAME +"|version:" + config.APP.NAME;

      var socket = io(connectUrl, { autoConnect: false, forceNew: true });
      this.set("socket", socket);
      socket.on("connect", function() {
        updateStatus();
        socket.io.engine.on("upgrade", updateStatus);
      });
      socket.on("notification", Ember.run.bind(this, this.notification));
      socket.on("disconnect", updateStatus);
      socket.on(
        "error",
        Ember.run.bind(this, function(reason) {
          // ignore xhr post error related to no internet connection
          if (
            typeof reason !== "object" ||
            (reason.type !== "TransportError" &&
              reason.message !== "xhr post error")
          ) {
            // this.get("logger").error(reason);
          }
        })
      );

      socket.on("update_store", Ember.run.bind(this, this.update_store));
      socket.on("_batch", Ember.run.bind(this, this.batch));
      socket.on("_resync", Ember.run.bind(this, this.resync));
      socket.on(
        "_settings",
        Ember.run.bind(this, function(settings) {
          this.set("deviceTtl", settings.device_ttl);
          this.set("lastOnline", Date.now());
        })
      );
      socket.connect(); // manually connect since it's not auto-connecting if you logout and then back in
    },

    unwire() {
      var socket = this.get("socket");
      if (socket) {
        socket.close();
        this.set("socket", null);
      }
    },

    unloadNotifications() {
      this.get("notifications").send("unloadNotifications");
    }
  },

  notification: function(data, success) {
    data.date = new Date(data.date);
    this.get("notifications.model").pushObject(data);
    run(success);
  },

  batch: function(events, success) {
    events.forEach(function(args) {
      var event = args[0];
      if (this[event]) {
        this[event].apply(this, args.slice(1));
      }
    }, this);

    run(success);
  },

  resync: function() {
    this.get("store").findAll("item");
  },

  getMessageUrl: function(data, type) {
    var router = this.get("target");
    var messageRoute = this.get("messagesUtil").getRoute(data.item[type]);
    var messageUrl = router.generate.apply(router, messageRoute);
    return (messageUrl = messageUrl.split("#").get("lastObject"));
  },

  markReadAndScroll: function(message) {
    if (message && !message.get("isRead")) {
      this.get("messagesUtil").markRead(message);

      var scrollOffset;
      if (Ember.$(".message-textbar").length > 0) {
        scrollOffset = Ember.$(document).height();
      }

      var screenHeight = document.documentElement.clientHeight;
      var pageHeight = document.documentElement.scrollHeight;

      if (scrollOffset && pageHeight > screenHeight) {
        Ember.run.later(this, function() {
          window.scrollTo(0, scrollOffset);
        });
      }
    }
  },
  // each action below is an event in a channel
  update_store: function(data, success) {
    var type = Object.keys(data.item)[0];
    var item = Ember.$.extend({}, data.item[type]);
    //Don't update data store for Offer/Item/schedule/delivery updates
    if (this.get("modelDataTypes").indexOf(type) >= 0) {
      return false;
    }
    if (type.toLowerCase() === "package") {
      //Changing type as we've Item model instead of Package
      type = "item";
      this.updateItemData(item);
      delete item.offer_id;
      //Removing null for empty packages_location_id arrays
      if (item.packages_location_ids) {
        item.packages_location_ids = item.packages_location_ids.compact();
      }
      if (item.image_ids) {
        item.image_ids = item.image_ids.compact();
      }
      //Don't update Data-store if Item has 0 qty and no designation
      if (!item.designation_id && !item.quantity) {
        return false;
      }
      if (this.get("status.online")) {
        this.store.findRecord("item", item.id);
        this.store.query("orders_package", { search_by_package_id: item.id });
      }
      //Deleting ids in case of null
      if (item.orders_package_ids && !item.orders_package_ids.length) {
        delete item.orders_package_ids;
      }
      if (!item.designation_id) {
        delete item.designation_id;
      }
      if (!item.item_id) {
        delete item.item_id;
      }
    }

    this.store.normalize(type, item);

    if (type.toLowerCase() === "designation" && data.operation === "create") {
      return false;
    } else if (type.toLowerCase() === "designation") {
      this.store.pushPayload(data.item);
      return false;
    }

    if (type.toLowerCase() !== "message") {
      this.setFavImage(item, data, type);
    }

    var existingItem = this.store.peekRecord(type, item.id);
    var hasNewItemSaving = this.store.peekAll(type).any(function(o) {
      return o.id === null && o.get("isSaving");
    });
    var existingItemIsSaving = existingItem && existingItem.get("isSaving");
    if (
      (data.operation === "create" && hasNewItemSaving) ||
      existingItemIsSaving
    ) {
      run(success);
      return;
    }

    if (["create", "update"].indexOf(data.operation) >= 0) {
      var payload = {};
      payload[type] = item;
      this.store.pushPayload(payload);

      if (type === "message") {
        // push new sender with message
        this.store.pushPayload(data.sender);
      }
    } else if (existingItem) {
      //delete
      this.store.unloadRecord(existingItem);
    }

    // mark message read here
    if (type === "message") {
      var currentUrl = window.location.href.split("#").get("lastObject");
      var messageUrl = this.getMessageUrl(data, type);

      if (currentUrl.indexOf(messageUrl) >= 0) {
        var message = this.store.peekRecord("message", item.id);
        this.markReadAndScroll(message);
      }
    }

    run(success);
  }
});
