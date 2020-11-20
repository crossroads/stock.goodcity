import Ember from "ember";
import config from "../config/environment";
import AjaxPromise from "../utils/ajax-promise";

export default Ember.Mixin.create({
  messages: Ember.inject.service(),

  preloadData: function() {
    var promises = [];
    var retrieve = types => types.map(type => this.store.findAll(type));

    if (this.get("session.authToken")) {
      promises.push(
        new AjaxPromise(
          "/auth/current_user_profile",
          "GET",
          this.session.get("authToken")
        ).then(data => {
          this.store.pushPayload(data);
          this.store.pushPayload({ user: data.user_profile });
          this.notifyPropertyChange("session.currentUser");
        })
      );
      // promises = promises.concat(this.store.query("code", { stock: true }));
      // promises = promises.concat(
      //   this.store.query("cancellation_reason", { for: "order" })
      // );
      promises = promises.concat(retrieve(config.APP.PRELOAD_TYPES));
      promises.push(this.get("messages").fetchUnreadMessageCount());
    }

    return Ember.RSVP.all(promises);
  }
});
