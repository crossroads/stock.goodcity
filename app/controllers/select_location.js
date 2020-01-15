import { sort } from "@ember/object/computed";
import searchModule from "./search_module";

export default searchModule.extend({
  searchModelName: "location",

  sortProperties: ["createdAt:desc"],
  recentlyUsedLocations: sort("model", "sortProperties"),

  actions: {
    setLocation(location) {
      window.localStorage.setItem("isSelectLocationPreviousRoute", true);
      this.replaceRoute("items.new", {
        queryParams: { locationId: location.get("id") }
      });
    }
  }
});
