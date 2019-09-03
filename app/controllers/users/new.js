import config from "../../config/environment";
import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  phoneNumberPlaceholder: t("organisation.user.phone_number"),
  fNamePlaceholder: t("organisation.user.john"),
  lNamePlaceholder: t("organisation.user.doe"),
  emailPlaceholder: t("organisation.user.email"),
  positionPlaceholder: t("organisation.user.position_in_organisation"),
  preferredPhonePlaceholder: t("organisation.user.phone_number"),
  mobilePhone: "",
  preferredPhone: "",
  organisationId: Ember.computed.alias("model.id"),
  messageBox: Ember.inject.service(),

  clearFormData() {
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
    this.set("position", "");
    this.set("preferredPhone", "");
  },

  formatMobileNumber(mobileNumber) {
    if (mobileNumber.length) {
      return mobileNumber;
    } else {
      return mobileNumber;
    }
  },

  actions: {
    saveUser() {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var mobilePhone =
        config.APP.HK_COUNTRY_CODE +
        this.formatMobileNumber(this.get("mobilePhone"));
      var preferredPhone = this.formatMobileNumber(this.get("preferredPhone"));
      var firstName = this.get("firstName");
      var lastName = this.get("lastName");
      var organisationId = this.get("organisationId");
      var position = this.get("position");
      var email = this.get("email");
      new AjaxPromise(
        "/organisations_users",
        "POST",
        this.get("session.authToken"),
        {
          organisations_user: {
            organisation_id: organisationId,
            position: position,
            preferred_contact_number: preferredPhone,
            user_attributes: {
              first_name: firstName,
              last_name: lastName,
              mobile: mobilePhone,
              email: email
            }
          }
        }
      )
        .then(data => {
          this.get("store").pushPayload(data);
          this.clearFormData();
          this.transitionToRoute("organisations.users", organisationId);
        })
        .catch(xhr => {
          if (xhr.status === 422) {
            this.get("messageBox").alert(xhr.responseJSON.errors);
          } else {
            throw xhr;
          }
        })
        .finally(() => loadingView.destroy());
    },

    cancelForm() {
      this.get("messageBox").custom(
        "You will lose all your data. Are you sure you want to cancel this item?",
        "Yes",
        () => {
          Ember.run.later(
            this,
            function() {
              this.transitionToRoute(
                "organisations.users",
                this.get("organisationId")
              );
              this.clearFormData();
            },
            0
          );
        },
        "No"
      );
    }
  }
});
