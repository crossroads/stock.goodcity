import Ember from "ember";
import _ from "lodash";
import AjaxPromise from "stock/utils/ajax-promise";

const { computed } = Ember;

const MSG_KEY = msg => {
  return [
    msg.get("isPrivate") ? "private" : "public",
    msg.get("designationId") || "-",
    msg.get("itemId") || "-"
  ].join("/");
};

export default Ember.Controller.extend({
  sortProperties: ["createdAt:desc"],
  sortedModel: Ember.computed.sort("model", "sortProperties"),
  messagesUtil: Ember.inject.service("messages"),
  store: Ember.inject.service(),
  logger: Ember.inject.service(),
  subscription: Ember.inject.service(),
  hasLoadedReadMessages: false,
  displayMessages: true,
  showUnread: true,
  notifications: [],

  init() {
    // When a new message arrives, we move it to the top
    this.get("subscription").on("change:message", this, this.onNewNotification);
  },

  onNewNotification(notification) {
    const store = this.get("store");
    const msg = store.peekRecord("message", notification.record.id);
    const orderId = notification.record.order_id;
    const notifications = this.get("notifications");

    if (msg.get("isUnread")) {
      this.get("messagesUtil")._incrementCount();
    }

    if (!orderId || this.session.router.currentURL !== "/my_notifications") {
      return;
    }

    this.loadIfAbsent("designation", orderId).then(() => {
      let notif = notifications.findBy("key", MSG_KEY(msg));
      if (notif) {
        // Update existing one
        notifications.removeObject(notif);
        notif.get("messages").addObject(msg);
      } else {
        // Create new one
        notif = this.messagesToNotification([msg]);
      }
      notifications.insertAt(0, notif);
    });
  },

  /**
   * Creates a single notification out of multiple messages
   *
   * @param {*} messages
   * @returns
   */
  messagesToNotification(messages) {
    const props = [
      "id",
      "itemId",
      "designation",
      "sender",
      "createdAt",
      "isPrivate"
    ];
    const lastMessage = messages.sortBy("createdAt").get("lastObject");
    const item =
      lastMessage.get("itemId") &&
      this.get("store").peekRecord("item", lastMessage.get("itemId"));

    let notification = Ember.Object.create(lastMessage.getProperties(props));
    notification.setProperties({
      key: MSG_KEY(lastMessage),
      item: item,
      messages: messages,
      isSingleMessage: computed.equal("messages.length", 1),
      isThread: computed.not("isSingleMessage"),
      designationId: computed.alias("messages.firstObject.designationId"),
      text: computed("messages.[]", function() {
        return this.get("messages")
          .sortBy("createdAt")
          .get("lastObject.body");
      }),
      unreadCount: computed("messages.@each.state", "messages.[]", {
        get() {
          return this.get("messages")
            .filterBy("isUnread")
            .get("length");
        },
        set(key, value) {
          return value;
        }
      })
    });
    return notification;
  },

  /**
   * Transform offers into "notifications" object with more UI-friendly properties
   *
   * @param {Offer} offer
   * @returns {Object}
   */
  buildNotifications(order) {
    const orderMessages = order.get("messages").filter(msg => {
      return this.get("showUnread") ? msg.get("isUnread") : true;
    });

    return _.chain(orderMessages)
      .groupBy(MSG_KEY)
      .map(msgs => this.messagesToNotification(msgs))
      .value();
  },

  /**
   * Injects API JSON into the store and returns a list of models
   *
   * @param {Object} data
   * @returns {Offer[]}
   */
  toOrderModels(data) {
    this.get("store").pushPayload(data);
    return data.map(({ id }) => {
      return this.get("store").peekRecord("designation", id);
    });
  },

  /**
   * Loads a record from either the store or the api
   *
   * @param {String} model
   * @param {String} id
   * @returns {Model}
   */
  loadIfAbsent(model, id) {
    const store = this.get("store");
    return Ember.RSVP.resolve(
      store.peekRecord(model, id) || store.findRecord(model, id)
    );
  },

  actions: {
    /**
     * Loads a page of offers
     * Used by the infinite list
     *
     * @param {*} pageNo
     * @returns
     */
    loadMoreMessages(pageNo) {
      const state = this.get("showUnread") ? "unread" : "all";

      const params = {
        page: pageNo,
        include_messages: true,
        with_notifications: state
      };

      return this.get("store")
        .query("designation", params)
        .then(orders => this.toOrderModels(orders.content))
        .then(orders => {
          const notifications = _.chain(orders)
            .map(o => this.buildNotifications(o))
            .flatten()
            .value();

          this.get("notifications").addObjects(notifications);
          return notifications;
        });
    },

    view(messageId) {
      var message = this.store.peekRecord("message", messageId);
      var route = this.get("messagesUtil").getRoute(message);
      this.transitionToRoute.apply(this, route);
    },

    markThreadRead(notification) {
      if (notification.get("unreadCount") === 1) {
        var message = this.store.peekRecord("message", notification.id);
        this.get("messagesUtil").markRead(message);
        notification.set("unreadCount", 0);
      } else {
        this.send("view", notification.id);
      }
    },

    toggleShowUnread() {
      this.set("displayMessages", false);
      this.get("notifications").clear();
      Ember.run.later(this, function() {
        let showUnread = !this.get("showUnread");
        this.set("showUnread", showUnread);
        this.set("displayMessages", true);
      });
    },

    markAllRead() {
      this.get("messagesUtil")
        .markAllRead()
        .then(() => {
          this.get("notifications").forEach(n => {
            n.set("unreadCount", 0);
          });
        })
        .catch(e => {
          this.get("logger").error(e);
        });
    }
  }
});
