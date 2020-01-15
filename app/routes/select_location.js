import { computed } from "@ember/object";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  isSelectLocationPreviousRoute: computed.localStorage(),

  model() {
    this.set("isSelectLocationPreviousRoute", true);
    var recentlyUsedLocations = this.store
      .peekAll("location")
      .filterBy("recentlyUsedAt");
    return recentlyUsedLocations.length
      ? recentlyUsedLocations
      : this.store.query("location", { recently_used: true });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("searchText", "");
  }
});
