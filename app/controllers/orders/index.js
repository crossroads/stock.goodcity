import searchModule from "../search_module";

export default searchModule.extend({

  searchModelName: "designation",
  unloadAll: true,
  minSearchTextLength: 2,

  onItemLoaded(record) {
    const orgId = record.get("gcOrganisationId");
    if (orgId) {
      this.store.findRecord("gc_organisation", orgId, { reload: false });
    }
  }


});
