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

  actions: {
    saveUser() {
      const loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      const preferredContactValue = this.get("preferredPhone");
      const mobilePhone =
        this.get("mobilePhone.length") &&
        `${config.APP.HK_COUNTRY_CODE}${this.get("mobilePhone")}`;
      const preferredPhone =
        preferredContactValue.length && preferredContactValue;
      const firstName = this.get("firstName");
      const lastName = this.get("lastName");
      const organisationId = this.get("organisationId");
      const position = this.get("position");
      const email = this.get("email");
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
