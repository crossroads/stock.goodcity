import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  createUser(userParams) {
    return this.POST(`/users`, userParams);
  },

  editUser(userId, userParams) {
    return this.PUT(`/users/${userId}`, userParams);
  }
});
