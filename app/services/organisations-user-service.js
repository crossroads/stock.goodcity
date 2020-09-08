import Ember from "ember";
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  async getAllStatus() {
    const data = await this.GET("/user_status");
    return data;
  },

  getOrganisationUser(organisation_id, user_id) {
    return this.GET(`/organisations_users/organisation_user`, {
      organisation_id,
      user_id
    });
  },

  create(params) {
    return this.POST("/organisations_users", { organisations_user: params });
  },

  update(params, id) {
    return this.PUT(`/organisations_users/${id}`, {
      organisations_user: params
    });
  }
});
