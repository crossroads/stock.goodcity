import Ember from "ember";
import detail from "./detail";

export default detail.extend({
  setOrgUserApproval(status) {
    this.runTask(() => {
      this.get("organisationsUser").set("status", status);
      return this.get("organisationsUser").save();
    });
  },

  actions: {
    approveOrganisationsUser() {
      this.setOrgUserApproval("approved");
    },
    denyOrganisationsUser() {
      this.setOrgUserApproval("denied");
    }
  }
});
