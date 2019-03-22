import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";

function run(func) {
  if (func) {
    func();
  }
}

const ALL_OPERATIONS = ["create", "update", "delete"];

const UPDATE_STRATEGY = {
  RELOAD: (store, type, record) => {
    store.findRecord(type, record.id);
  },
  MERGE: (store, type, record) => {
    store.pushPayload({ [type]: record });
  }
};

/**
 * Subscription service
 *
 */
export default Ember.Service.extend(Ember.Evented, {
  messagesUtil: Ember.inject.service("messages"),
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  socket: null,
  lastOnline: Date.now(),
  deviceTtl: 0,
  deviceId: Math.random()
    .toString()
    .substring(2),
  status: {
    online: false
  },
  connectUrl: Ember.computed("session.authToken", "deviceId", function() {
    return (
      config.APP.SOCKETIO_WEBSERVICE_URL +
      `?token=${encodeURIComponent(this.get("session.authToken"))}` +
      `&deviceId=${this.get("deviceId")}` +
      `&meta=appName:${config.APP.NAME}`
    );
  }),

  // -----------
  // Config
  // -----------
  unhandledTypes: [
    // those types will be ignored
    "offer",
    "item",
    "schedule",
    "delivery",
    "gogovan_order",
    "contact",
    "address",
    "order"
  ],
  importStrategies: {
    // define how we handle incoming changes
    designation: {
      operations: ["update", "delete"]
    },
    item: {
      strategy: UPDATE_STRATEGY.RELOAD
    },
    defaults: {
      operations: ALL_OPERATIONS,
      strategy: UPDATE_STRATEGY.MERGE
    }
  },
  internalTypeMapping: {
    // type renaming
    package: "item"
  },

  // -----------
  // Watch
  // -----------
  updateStatus: Ember.observer("socket", function() {
    var socket = this.get("socket");
    var online = navigator.connection
      ? navigator.connection.type !== "none"
      : navigator.onLine;
    online = socket && socket.connected && online;
    this.set("status", { online: online });
  }),

  // resync if offline longer than deviceTtl
  checkdeviceTTL: Ember.observer("status.online", function() {
    let online = this.get("status.online");
    let deviceTtl = this.get("deviceTtl");
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

  // -----------
  // Implementation
  // -----------
  init() {
    var updateStatus = Ember.run.bind(this, this.updateStatus);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  },

  getStrategy(type) {
    let defaultStrat = this.importStrategies.defaults;
    let typeStrat = this.importStrategies[type] || {};
    return _.extend({}, defaultStrat, typeStrat);
  },

  operationIsAllowed(operation, type) {
    let { operations } = this.getStrategy(type);
    return operations.indexOf(operation) >= 0;
  },

  resolveTypeAliases(type) {
    const typeMapping = this.get("internalTypeMapping");
    return typeMapping[type] || type;
  },

  wire() {
    let updateStatus = Ember.run.bind(this, this.updateStatus);
    let socket = io(this.get("connectUrl"), {
      autoConnect: false,
      forceNew: true
    });

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
          console.warn(`[Subscription] Socker error`, reason);
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

  notification: function(data, success) {
    data.date = new Date(data.date);
    this.trigger("notification", data);
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

  update_store(data, success) {
    let { item: payload, operation } = data;
    let type = Object.keys(payload)[0].toLowerCase();
    let record = Ember.$.extend({}, payload[type]);

    if (this.get("unhandledTypes").indexOf(type) >= 0) {
      console.warn(`[Subscription] Unhandled data type '${type}'`);
      return false;
    }

    if (!this.operationIsAllowed(operation, type)) {
      console.warn(
        `[Subscription] Ignoring a '${operation}' operation for type '${type}'`
      );
      return false;
    }

    type = this.resolveTypeAliases(type);

    if (operation === "create" && this.wasCreatedByUs(type, record)) {
      return false;
    }

    const store = this.get("store");
    switch (operation) {
      case "create":
      case "update":
        const { strategy } = this.getStrategy(type);
        strategy(store, type, record);
        break;
      case "delete":
        store.unloadRecord(existingItem);
        break;
      default:
        console.error(`[Subscription] Unsupported operation '${operation}'`);
        return false;
    }

    this.trigger(`change:${type}`, { type, operation, record });

    run(success);
    return true;
  },

  wasCreatedByUs(type, record) {
    // @TODO: fix - this implementation is flawed and likely to cause edge case bugs
    let existingItem = this.get("store").peekRecord(type, record.id);
    let hasNewItemSaving = this.get("store")
      .peekAll(type)
      .any(o => o.id === null && o.get("isSaving"));
    let existingItemIsSaving = existingItem && existingItem.get("isSaving");
    return hasNewItemSaving || existingItemIsSaving;
  }
});
