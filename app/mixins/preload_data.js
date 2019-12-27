import Ember from "ember";
import config from "../config/environment";
import AjaxPromise from "../utils/ajax-promise";

export default Ember.Mixin.create({
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
      promises = promises.concat(this.queryResourcesForStock());
      promises = promises.concat(retrieve(config.APP.PRELOAD_TYPES));
    }

    return Ember.RSVP.all(promises);
  },

  queryResourcesForStock() {
    return config.APP.PRELOAD_QUERY_STOCK_TYPES.map(type =>
      this.store.query(type, { stock: true })
    );
  }
});
