import searchModule from "./search_module";
import Ember from 'ember';

export default searchModule.extend({
  searchModelName: "location",
  queryParams: ["applyStateFilter", "applyLocationFilter"],
  applyStateFilter: null,
  applyLocationFilter: null,
  unloadAll: true,
  sortProperties: ["building", "area"],
  sortedLocations: Ember.computed.sort("model", "sortProperties"),
  recentlyUsedLocations: Ember.computed.sort("model", "sortProperties"),
  filterService: Ember.inject.service(),
  paginationOpts() {
    return {
      perPage: 25,
      startingPage: 1,
      modelPath: 'sortedLocations',
      stockRequest: true
    };
  },

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      this.store.unloadAll("location");

      this.infinityModel(this.get("searchModelName"),
        this.paginationOpts(),
        this.buildQueryParamMap()
      ).then(data => {
        if(this.get("searchText") === data.meta.search) {
          let buildingNames = data.getEach("building").uniq();
          buildingNames.forEach(buildingName => {
            this.store.createRecord("location", { building: buildingName, area: "(All areas)" });
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
      window.localStorage.removeItem("itemLocationFilters");
      window.localStorage.setItem("itemLocationFilters", location.get("name"));
      this.get('filterService').notifyPropertyChange('getItemLocationFilters');
      this.transitionToRoute("items.index");
    },
    clearLocationAndRedirect() {
      window.localStorage.removeItem("itemLocationFilters");
      this.get('filterService').notifyPropertyChange("getItemLocationFilters");
      this.transitionToRoute("items.index");
    }
  }
});

