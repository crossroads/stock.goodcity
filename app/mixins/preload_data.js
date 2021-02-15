import Ember from "ember";
import config from "../config/environment";
import AjaxPromise from "../utils/ajax-promise";

export default Ember.Mixin.create({
  messages: Ember.inject.service(),
  i18n: Ember.inject.service(),
  userService: Ember.inject.service(),

  preloadData: function() {
    var promises = [];
    var retrieve = types => types.map(type => this.store.findAll(type));

    if (this.get("session.authToken")) {
      promises.push(
        this.get("userService")
          .currentUser()
          .then(data => {
            this.store.pushPayload(data);
            this.store.pushPayload({ user: data.user_profile });
            this.notifyPropertyChange("session.currentUser");
          })
      );
      promises = promises.concat(retrieve(config.APP.PRELOAD_TYPES));
      promises.push(this.get("messages").fetchUnreadMessageCount());
      promises.push(this.store.query("code", { stock: true }));
    }

    return Ember.RSVP.all(promises);
  }
});
