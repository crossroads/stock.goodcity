import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";

import { ORGANISATION_STATUS } from "../constants/states";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  /**
   * Fetch ALL user status.
   * Converts it to title case and a key value pair mapping
   * @returns {Array.<Object>} with id as key and name as value
   */
  async getAllStatus() {
    let statusList = ORGANISATION_STATUS;
    statusList = Object.keys(statusList).map((val, index) => ({
      id: index,
      name: _.startCase(_.toLower(val))
    }));
    return statusList;
  },

  /**
   * Fetch organisations_user record for a given organisation and user
   * @param {Number} organisation_id
   * @param {Number} user_id
   * @returns {Promise}
   */
  getOrganisationUser(organisation_id, user_id) {
    const user = this.get("store").peekRecord("user", user_id);
    const usersOrganisations = user.get("organisationsUsers");

    return usersOrganisations.find(
      data => +data.get("organisationId") === +organisation_id
    );
  }
});
