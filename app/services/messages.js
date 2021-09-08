import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Service.extend({
  logger: Ember.inject.service(),
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  subscription: Ember.inject.service(),

  unreadMessageCount: 0,

  init() {
    this._super(...arguments);
    this.get("subscription").on("change:message", this, this.onNewNotification);
  },

  onNewNotification(notification) {
    const msg = this.get("store").peekRecord("message", notification.record.id);

    if (notification.operation === "create" && msg.get("isUnread")) {
      this._incrementCount();
    } else if (
      notification.operation === "update" &&
      notification.record.state === "read"
    ) {
      this._decrementCount();
    }
  },

  fetchUnreadMessageCount() {
    return this._queryMessages("unread", 1, 1)
      .then(data => {
        const count = data.meta && data.meta.total_count;
        this.set("unreadMessageCount", count || 0);
      })
      .catch(e => this._onError(e));
  },

  _queryMessages(state, page, perPage) {
    return new AjaxPromise("/messages", "GET", this.get("session.authToken"), {
      state: state,
      messageable_type: ["Order", "Package"],
      page: page,
      per_page: perPage
    });
  },

  queryNotifications(page, state) {
    const params = {
      page: page,
      state: state,
      messageable_type: ["Order", "Package"]
    };

    return new AjaxPromise(
      "/messages/notifications",
      "GET",
      this.get("session.authToken"),
      params
    );
  },

  markRead: function(message) {
    if (message.get("isUnread")) {
      var adapter = getOwner(this).lookup("adapter:application");
      var url = adapter.buildURL("message", message.id) + "/mark_read";
      adapter
        .ajax(url, "PUT")
        .then(data => {
          delete data.message.id;
          message.setProperties(data.message);
          this._decrementCount();
        })
        .catch(error => this.get("logger").error(error));
    }
  },

  markAllRead() {
    return new AjaxPromise(
      "/messages/mark_all_read",
      "PUT",
      this.get("session.authToken"),
      {
        scope: ["order", "package"]
      }
    ).then(() => {
      this.get("store")
        .peekAll("message")
        .filterBy("state", "unread")
        .forEach(message => {
          message.set("state", "read");
        });
      this.set("unreadMessageCount", 0);
    });
  },

  _onError(e) {
    this.get("logger").error(e);
  },

  getMessageRoute(messageableId, messageableType, isPrivate) {
    messageableType = messageableType === "Package" ? "item" : messageableType;

    if (isPrivate) {
      return [
        `${messageableType.toLowerCase()}s.staff_conversation`,
        messageableId
      ];
    } else if (messageableType === "Order") {
      return ["orders.conversation", messageableId];
    }
  },

  getRoute: function(message) {
    let messageableId = message.get
      ? message.get("messageableId")
      : message.messageable_id;

    let messageableType = message.get
      ? message.get("messageableType")
      : message.messageable_type;

    let messageRoute = this.getMessageRoute(
      messageableId,
      messageableType,
      message.get("isPrivate")
    );
    return messageRoute;
  },

  _incrementCount(step = 1) {
    const count = this.get("unreadMessageCount") + step;
    if (count < 0) {
      this.set("unreadMessageCount", 0);
    } else {
      this.set("unreadMessageCount", count);
    }
  },

  _decrementCount() {
    this._incrementCount(-1);
  }
});
