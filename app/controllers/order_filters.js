import Controller from "@ember/controller";

export default Controller.extend({
  queryParams: ["applyStateFilter", "applyTypeFilter", "applyTimeFilter"],
  applyStateFilter: null,
  applyTypeFilter: null,
  applyTimeFilter: null
});
