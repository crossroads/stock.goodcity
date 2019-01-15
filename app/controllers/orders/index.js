import Ember from 'ember';
import searchModule from "../search_module";

export default searchModule.extend({

  searchModelName: "designation",
  unloadAll: true,
  minSearchTextLength: 2,
  queryParams: ['preload'],

  onItemLoaded(record) {
    const orgId = Ember.get(record, 'gcOrganisationId');
    if (orgId) {
      this.store.findRecord("gc_organisation", orgId, { reload: false });
    }
  }
});
