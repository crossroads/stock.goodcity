import ApiBaseService from "./api-base-service";
import _ from "lodash";

export default ApiBaseService.extend({
  /**
   * Fetch ALL user status.
   * Converts it to title case and a key value pair mapping
   * @returns {Array.<Object>} with id as key and name as value
   */
  async getAllStatus() {
    let data = await this.GET(`/organisations_users/user_status`);

    data = data["status"].map((val, index) => ({
      id: index,
      name: _.startCase(_.toLower(val))
    }));
    return data;
  },

  /**
   * Fetch organisations_user record for a given organisation and user
   * @param {Number} organisation_id
   * @param {Number} user_id
   * @returns {Promise}
   */
  getOrganisationUser(organisation_id, user_id) {
    return this.GET(`/organisations_users/organisation_user`, {
      organisation_id,
      user_id
    });
  },

  /**
   * Create a new organisations_user object
   * @param {Object} params | The organisations_user properties
   * @param {string} params.organisation_id | The organisation_id
   * @param {string} params.user_id | The user_id
   * @param {string} params.position | User position
   * @param {string} params.status | Pending, Approved, Denied, Expired
   * @param {string} params.preferred_contact_number | Contact number
   * @returns {<Promise>} Promise object of created object
   */
  create(params) {
    return this.POST("/organisations_users", { organisations_user: params });
  },

  /**
   * Updates an organisations_user
   * @param {Object} params | The organisations_user properties
   * @param {Number} id | Id of user to be updated
   * @param {string} params.organisation_id | The organisation_id
   * @param {string} params.user_id | The user_id
   * @param {string} params.position | User position
   * @param {string} params.status | Pending, Approved, Denied, Expired
   * @param {string} params.preferred_contact_number | Contact number
   * @returns {<Promise>} Promise object of updated object
   */
  update(params, id) {
    return this.PUT(`/organisations_users/${id}`, {
      organisations_user: params
    });
  }
});
