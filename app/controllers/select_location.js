import Ember from "ember";
import searchModule from "./search_module";

export default searchModule.extend({
  searchModelName: "location",

  sortProperties: ["createdAt:desc"],
  recentlyUsedLocations: Ember.computed.sort("model", "sortProperties"),

  actions: {
    setLocation(location) {
      window.localStorage.setItem("isSelectLocationPreviousRoute", true);
      this.replaceRoute("items.new", {
        queryParams: { locationId: location.get("id") }
      });
    }
  }
});
