import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ["applyStateFilter", "applyTypeFilter"],
  applyStateFilter: null,
  applyTypeFilter: null
});
