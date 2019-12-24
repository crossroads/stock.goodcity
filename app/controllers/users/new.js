import { later } from "@ember/runloop";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import config from "../../config/environment";
import AjaxPromise from "stock/utils/ajax-promise";
import { translationMacro as t } from "ember-i18n";

export default Controller.extend({
  i18n: service(),
  phoneNumberPlaceholder: t("organisation.user.phone_number"),
  fNamePlaceholder: t("organisation.user.john"),
  lNamePlaceholder: t("organisation.user.doe"),
  emailPlaceholder: t("organisation.user.email"),
  positionPlaceholder: t("organisation.user.position_in_organisation"),
  mobilePhone: "",
  preferredPhone: "",
  organisationId: alias("model.id"),
  messageBox: service(),

  clearFormData() {
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
    this.set("position", "");
    this.set("preferredPhone", "");
  },

  formatMobileNumber() {
    const mobile = this.get("mobilePhone");
    if (mobile.length) {
      return config.APP.HK_COUNTRY_CODE + mobile;
    }
  },

  getRequestParams() {
    const preferredPhoneValue = this.get("preferredPhone");
    const mobilePhone = this.formatMobileNumber();
    const preferredPhone = preferredPhoneValue.length && preferredPhoneValue;
    const params = {
      organisation_id: this.get("organisationId"),
      position: this.get("position"),
      preferred_contact_number: preferredPhone,
      user_attributes: {
        first_name: this.get("firstName"),
        last_name: this.get("lastName"),
        mobile: mobilePhone,
        email: this.get("email")
      }
    };
    return {
      organisations_user: params
    };
  },

  actions: {
    saveUser() {
      const loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(
        "/organisations_users",
        "POST",
        this.get("session.authToken"),
        this.getRequestParams()
      )
        .then(data => {
          this.get("store").pushPayload(data);
          this.clearFormData();
          this.transitionToRoute(
            "organisations.users",
            this.get("organisationId")
          );
        })
        .catch(xhr => {
          if (xhr.status === 422) {
            this.get("messageBox").alert(xhr.responseJSON.errors[0].message);
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
          later(
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
