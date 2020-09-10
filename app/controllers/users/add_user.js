import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";
import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Controller.extend(AsyncMixin, ImageUploadMixin, {
  organisationId: null,
  organisationName: null,
  existingRoleIds: [],
  selectedRoleIds: [],
  mobilePhone: "",
  newUploadedImage: null,
  disabled: false,
  activeUser: Ember.computed.not("disabled"),
  organisationService: Ember.inject.service(),

  i18n: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  session: Ember.inject.service(),
  userImageKeys: Ember.computed.localStorage(),
  isMobileApp: config.cordova.enabled,

  locale: function(str) {
    return this.get("i18n").t(str);
  },

  canManageUserRoles: Ember.computed("allRoles.[]", function() {
    return (
      this.get("allRoles").length &&
      this.get("session.currentUser.canManageUserRoles")
    );
  }),

  allRoles: Ember.computed("model.roles.[]", function() {
    let roles = this.get("model.roles");
    let maxRoleLevel = this.get("getCurrentUser.maxRoleLevel");
    return (
      roles &&
      roles
        .rejectBy("name", "System")
        .filter(role => role.get("level") <= maxRoleLevel)
        .sortBy("name")
    );
  }),

  getCurrentUser: Ember.computed(function() {
    let store = this.get("store");
    let currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  charityRoleId: Ember.computed("model.roles.[]", function() {
    let store = this.get("store");
    let allRoles = store.peekAll("role");
    let charityRole = allRoles.find(role => role.get("name") === "Charity");
    return charityRole && charityRole.get("id");
  }),

  clearFormData() {
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
    this.set("selectedRoleIds", []);
    this.set("disabled", false);
    this.set("organisationName", "");
    this.set("newUploadedImage", null);
  },

  formatMobileNumber() {
    const mobile = this.get("mobilePhone");
    if (mobile.length) {
      return config.APP.HK_COUNTRY_CODE + mobile;
    }
  },

  getRequestParams() {
    const mobilePhone = this.formatMobileNumber();

    return {
      firstName: this.get("firstName"),
      lastName: this.get("lastName"),
      mobile: mobilePhone,
      email: this.get("email"),
      disabled: this.get("disabled"),
      organisations_users_ids: [this.get("organisationId")]
    };
  },

  saveImage() {
    let image = this.get("newUploadedImage");
    if (image) {
      return image.save();
    }
  },

  actions: {
    async searchOrganization() {
      const organisation = await this.get(
        "organisationService"
      ).userPickOrganisation();
      this.set("organisationName", organisation.get("nameEn"));
      this.set("organisationId", organisation.get("id"));
    },

    setSelectedIds(id, isSelected) {
      if (isSelected) {
        this.get("selectedRoleIds").pushObject(id);
      } else {
        this.get("selectedRoleIds").removeObject(id);
      }

      let hasCharityRole =
        this.get("selectedRoleIds").indexOf(this.get("charityRoleId")) >= 0;
      this.set("displayOrganizationInput", hasCharityRole);
    },

    saveUser() {
      let newUser = this.get("store").createRecord(
        "user",
        this.getRequestParams()
      );

      newUser.set("userRoleIds", this.getWithDefault("selectedRoleIds", []));

      return this.runTask(async () => {
        newUser.set("image", await this.saveImage());

        const { id } = await newUser.save();

        this.clearFormData();
        this.transitionToRoute("user_details", id);
      }, ERROR_STRATEGIES.MODAL);
    },

    cancelForm() {
      this.get("messageBox").custom(
        this.locale("users.cancel_user_warning").string,
        this.locale("yes").string,
        () => {
          Ember.run.later(
            this,
            function() {
              this.transitionToRoute("manage_users");
              this.clearFormData();
            },
            0
          );
        },
        this.locale("no").string
      );
    }
  }
});
