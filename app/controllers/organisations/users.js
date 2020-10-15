import Ember from "ember";

import OrganisationMixin from "stock/mixins/organisation";

export default Ember.Controller.extend(OrganisationMixin, {
  organisationUsers: null
});
