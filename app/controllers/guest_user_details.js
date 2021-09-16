import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import TitleAndLanguageMixin from "stock/mixins/grades_option";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.Controller.extend(AsyncMixin, TitleAndLanguageMixin, {
  user: Ember.computed.alias("model"),
  userService: Ember.inject.service(),
  printerService: Ember.inject.service(),
  application: Ember.inject.controller(),
  selectedAdminPrinterId: "",
  selectedStockPrinterId: "",

  getUserMobile() {
    return this.get("userService").getUserMobileWithCode(
      this.get("user.mobile")
    );
  },

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    saveDetails() {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(
        `/users/${this.get("user.id")}`,
        "PUT",
        this.get("session.authToken"),
        {
          user: {
            first_name: this.get("firstName"),
            last_name: this.get("lastName"),
            email: this.get("email"),
            title: this.get("selectedTitle.id")
          }
        }
      )
        .then(data => {
          this.get("store").pushPayload(data);
          this.transitionToRoute("no-permission");
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
