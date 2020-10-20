import Ember from "ember";
import _ from "lodash";
import AjaxPromise from "stock/utils/ajax-promise";

const { computed } = Ember;

const MSG_KEY = msg => {
  return [
    msg.get("isPrivate") ? "private" : "public",
    msg.get("messageableType") || "-",
    msg.get("messageableId") || "-"
  ].join("/");
};

export default Ember.Controller.extend({
  messagesUtil: Ember.inject.service("messages"),
  store: Ember.inject.service(),
  logger: Ember.inject.service(),
  subscription: Ember.inject.service(),

  displayMessages: true,
  showUnread: true,
  notifications: [],

  on() {
    // When a new message arrives, we move it to the top
    this.get("subscription").on("change:message", this, this.onNewNotification);
  },

  off() {
    this.get("subscription").off(
      "change:message",
      this,
      this.onNewNotification
    );
  },

  onNewNotification(notification) {
    const store = this.get("store");
    const msg = store.peekRecord("message", notification.record.id);
    const messageableId = notification.record.messageable_id;
    const notifications = this.get("notifications");

    if (
      !messageableId ||
      this.session.router.currentURL !== "/my_notifications"
    ) {
      return;
    }

    let notif = notifications.findBy("key", MSG_KEY(msg));

    if (notification.operation === "create") {
      if (notif) {
        // Update existing one
        notifications.removeObject(notif);
        msg.set("unreadCount", +notif.get("unreadCount") + 1);
        notif.get("messages").addObject(msg);
      } else {
        // Create new one
        msg.set("unreadCount", 1);
        notif = this.messagesToNotification([msg]);
      }
      notifications.insertAt(0, notif);
    } else if (
      notification.operation === "update" &&
      notif &&
      notification.record.state === "read"
    ) {
      notif.set("unreadCount", 0);
    }
  },

  /**
   * Creates a single notification out of multiple messages
   *
   * @param {*} messages
   * @returns
   */
  messagesToNotification(messages) {
    const props = ["id", "itemId", "sender", "createdAt", "isPrivate"];
    const lastMessage = messages.sortBy("id").get("lastObject");
    let itemId = lastMessage.get("itemId");
    const item =
      itemId &&
      (this.get("store").peekRecord("item", itemId) ||
        this.get("store").findRecord("item", itemId));

    let designationId = messages.get("firstObject.designationId");
    const designation =
      designationId &&
      (this.get("store").peekRecord("designation", designationId) ||
        this.get("store").findRecord("designation", designationId));

    let notification = Ember.Object.create(lastMessage.getProperties(props));
    notification.setProperties({
      key: MSG_KEY(lastMessage),
      item: item,
      messages: messages,
      isSingleMessage: computed.equal("unreadCount", 1),
      isThread: computed.not("isSingleMessage"),
      designation: designation,
      text: computed("messages.[]", function() {
        return this.get("messages")
          .sortBy("id")
          .get("lastObject.plainBody");
      }),
      unreadCount: computed("messages.@each.unreadCount", "messages.[]", {
        get() {
          let lastMessage = this.get("messages")
            .sortBy("id")
            .get("lastObject");
          return lastMessage.get("unreadCount");
        },
        set(key, value) {
          return value;
        }
      })
    });
    return notification;
  },

  /**
   * Transform messages into "notifications" object with more UI-friendly properties
   *
   * @param {Message} messages
   * @returns {Object}
   */
  buildNotifications(messages) {
    const groupedMessages = messages.filter(msg => {
      return this.get("showUnread") ? msg.get("isUnread") : true;
    });

    return _.chain(groupedMessages)
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
  toMessageModels(data) {
    this.get("store").pushPayload(data);
    return data.messages.map(({ id }) => {
      return this.get("store").peekRecord("message", id);
    });
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
      const state = this.get("showUnread") ? "unread" : "";

      this.get("messagesUtil")
        .queryNotifications(pageNo, state)
        .then(data => this.toMessageModels(data))
        .then(messages => {
          const notifications = _.chain(messages)
            .groupBy(MSG_KEY)
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
