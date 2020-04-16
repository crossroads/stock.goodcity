import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Service.extend({
  logger: Ember.inject.service(),
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  unreadMessageCount: 0,

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
      scope: "order",
      page: page,
      per_page: perPage
    });
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
      {}
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

  getMessageRoute(orderId) {
    return ["orders.conversation", orderId];
  },

  getRoute: function(message) {
    var orderId = message.get
      ? message.get("designation.id")
      : message.designation_id;
    var messageRoute = this.getMessageRoute(orderId);
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
