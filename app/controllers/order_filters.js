import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["applyStateFilter", "applyTypeFilter", "applyTimeFilter"],
  applyStateFilter: null,
  applyTypeFilter: null,
  applyTimeFilter: null
});
