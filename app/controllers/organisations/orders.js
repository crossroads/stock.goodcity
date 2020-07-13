import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  gcOrganisationUsers: null,
  organisationService: Ember.inject.service(),

  actions: {
    loadOrders(pageNo) {
      const organisationId = this.get("model.id");
      const params = this.trimQuery(
        _.merge({}, this.getPaginationQuery(pageNo))
      );
      return this.get("organisationService").getOrganisationOrders(
        organisationId,
        params
      );
    }
  }
});
