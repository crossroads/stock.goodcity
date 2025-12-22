import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: [
    "applyStateFilter",
    "applyTypeFilter",
    "applyTimeFilter",
    "orderNeedsResponse"
  ],
  applyStateFilter: null,
  applyTypeFilter: null,
  applyTimeFilter: null,
  orderNeedsResponse: false
});
