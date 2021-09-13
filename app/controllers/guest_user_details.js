import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import TitleAndLanguageMixin from "stock/mixins/grades_option";

export default Ember.Controller.extend(AsyncMixin, TitleAndLanguageMixin, {
  user: Ember.computed.alias("model"),
  userService: Ember.inject.service(),
  printerService: Ember.inject.service(),
  selectedAdminPrinterId: "",
  selectedStockPrinterId: "",

  getUserMobile() {
    return this.get("userService").getUserMobileWithCode(
      this.get("user.mobile")
    );
  },

  actions: {
    saveDetails() {
      this.runTask(async () => {
        let user = this.get("user");
        user.set("firstName", this.get("firstName"));
        user.set("lastName", this.get("lastName"));
        user.set("email", this.get("email"));
        user.set("title", this.get("selectedTitle.id") || "Mr");

        try {
          await user.save();
          this.transitionToRoute("no-permission");
        } catch (e) {
          this.get("user").rollbackAttributes();
          throw e;
        }
      }, ERROR_STRATEGIES.MODAL);
    }
  }
});
