import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";
import OrganisationMixin from "stock/mixins/organisation";

export default Ember.Controller.extend(SearchMixin, OrganisationMixin, {
  organisationUsers: null,
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
