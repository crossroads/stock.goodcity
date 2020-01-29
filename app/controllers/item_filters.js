import { inject as service } from "@ember/service";
import { sort } from "@ember/object/computed";
import searchModule from "./search_module";

export default searchModule.extend({
  searchModelName: "location",
  queryParams: ["applyStateFilter", "applyLocationFilter"],
  applyStateFilter: null,
  applyLocationFilter: null,
  unloadAll: true,
  sortProperties: ["building", "area"],
  sortedLocations: sort("model", "sortProperties"),
  recentlyUsedLocations: sort("model", "sortProperties"),
  filterService: service(),
  paginationOpts() {
    return {
      perPage: 25,
      startingPage: 1,
      modelPath: "sortedLocations",
      stockRequest: true
    };
  },

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      this.store.unloadAll("location");

      this.infinityModel(
        this.get("searchModelName"),
        this.paginationOpts(),
        this.buildQueryParamMap()
      )
        .then(data => {
          if (this.get("searchText") === data.meta.search) {
            let area = "(All areas)";
            let buildingNames = data.getEach("building").uniq();
            buildingNames.forEach(building => {
              this.store.createRecord("location", { building, area });
            });
            this.set("model", this.store.peekAll("location"));
            this.set("hasNoResults", !data.get("length"));
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("model", []);
  },

  actions: {
    setLocation(location) {
      this.get("filterService").set(
        "itemLocationFilters",
        location.get("name")
      );
      this.transitionToRoute("items.index");
    },
    clearLocationAndRedirect() {
      this.get("filterService").set("itemLocationFilters", "");
      this.transitionToRoute("items.index");
    }
  }
});
