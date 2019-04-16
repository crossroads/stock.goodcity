import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  infinity: Ember.inject.service(),

  model() {
    return this.get("infinity").model("gcOrganisation", {
      perPage: 12,
      startingPage: 1,
      searchText: "jockey"
    });
  }
});
