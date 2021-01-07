import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model() {
    var recentlyUsedLocations = this.store
      .peekAll("location")
      .filterBy("recentlyUsedAt");
    return recentlyUsedLocations.length
      ? recentlyUsedLocations
      : this.store.query("location", { recently_used: true });
  },

  deactivate() {
    let controller = this.controllerFor("itemFilters");
    let queryParams = controller.get("queryParams");
    queryParams.forEach(queryParam => controller.set(queryParam, null));
  },

  setupController(controller, model) {
    this._super(controller, model);
    let buildingNames = model.getEach("building").uniq();
    buildingNames.forEach(buildingName => {
      this.store.createRecord("location", {
        building: buildingName,
        area: "(All areas)"
      });
    });
    controller.set("model", this.store.peekAll("location"));
    controller.set("searchText", "");
  }
});
