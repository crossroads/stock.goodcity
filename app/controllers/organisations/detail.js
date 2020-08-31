import Ember from "ember";

export default Ember.Controller.extend({
  gcOrganisationUsers: null,
  backLinkPath: "",

  actions: {
    onFocusOut() {
      this.get("model").rollback();
    }
  }
});
