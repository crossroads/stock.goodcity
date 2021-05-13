import Ember from "ember";
import _ from "lodash";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import OrganisationMixin from "stock/mixins/organisation";

export default Ember.Controller.extend(OrganisationMixin, AsyncMixin, {
  organisationsUserService: Ember.inject.service(),
  userService: Ember.inject.service(),
  session: Ember.inject.service(),
  user: Ember.computed.alias("model"),
  disableUserPopupVisible: false,
  enableUserPopupVisible: false,
  updateUserMessagePopupVisible: false,
  isDisabledUser: Ember.computed.alias("user.disabled"),
  minSearchTextLength: 3,

  canDisableUsers: Ember.computed("user.id", function() {
    return (
      this.get("session.currentUser.canDisableUsers") &&
      +this.get("session.currentUser.id") !== +this.get("user.id")
    );
  }),

  canMergeUsers: Ember.computed("user.id", function() {
    return (
      this.get("session.currentUser.canMergeUsers") &&
      +this.get("session.currentUser.id") !== +this.get("user.id")
    );
  }),

  showEnableUserMessage: Ember.computed.and(
    "canDisableUsers",
    "isDisabledUser"
  ),

  canManageCharityPosition: Ember.computed(function() {
    return this.get("session")
      .get("currentUser")
      .get("canManageOrganisationsUsers");
  }),

  userOrganisationDetails: Ember.computed(
    "model",
    "model.organisationsUsers.[]",
    "model.organisationsUsers.@each.userStatus",
    function() {
      const organisationUser = [];

      this.get("model.organisationsUsers").map(record => {
        organisationUser.push({
          id: record.get("id"),
          status: record.get("userStatus"),
          name: this.store
            .peekRecord("organisation", record.get("organisationId"))
            .get("nameEn")
        });
      });
      return organisationUser;
    }
  ),

  adminRoleAccess: Ember.computed(
    "user.activeRoles.@each.expiresAt",
    function() {
      return this.get("userService").getRoleAccessText(
        this.get("user"),
        "admin"
      );
    }
  ),

  stockRoleAccess: Ember.computed(
    "user.activeRoles.@each.expiresAt",
    function() {
      return this.get("userService").getRoleAccessText(
        this.get("user"),
        "stock"
      );
    }
  ),

  toggleUserAccount(options) {
    if (this.get("canDisableUsers")) {
      let user = this.get("user");

      this.runTask(async () => {
        user.set("disabled", options.disabled);
        await user.save();
      }, ERROR_STRATEGIES.MODAL);
    }
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    this.hideResults();
    if (this.get("searchText").trim().length >= 3) {
      Ember.run.debounce(this, this.showResults, 500);
    }
  }),

  hideResults() {
    this.set("displayResults", false);
  },

  showResults() {
    this.set("displayResults", true);
  },

  actions: {
    searchUsers(page) {
      const params = {
        page: page,
        per_page: 25,
        searchText: this.get("searchText"),
        stockRequest: true
      };

      return this.get("store").query("user", params);
    },

    cancelMerge() {
      this.set("searchUser", false);
      this.set("searchText", "");
    },

    searchUserToMerge() {
      this.set("searchUser", true);
    },

    disableUser() {
      this.toggleUserAccount({ disabled: true });
    },

    cancelDisableUser() {
      this.set("disableUserPopupVisible", false);
    },

    cancelEnableUser() {
      this.set("enableUserPopupVisible", false);
    },

    checkUserValidity() {
      let user = this.get("user");
      if (user.get("email").length === 0 && user.get("mobile").length === 0) {
        this.set("updateUserMessagePopupVisible", true);
      } else {
        this.send("displayEnableUserPopup");
      }
    },

    displayDisableUserPopup() {
      this.set("disableUserPopupVisible", true);
    },

    displayEnableUserPopup() {
      this.set("enableUserPopupVisible", true);
    },

    enableUser() {
      this.toggleUserAccount({ disabled: false });
    },

    /**
     * Navigate to charity_position screen
     * If user is already present in selected organisation, then organisations_users record
     * already exists. In that case, it will be an edit operation
     *
     * If user is not present in the selected organisation, then it will be a create operation
     */
    async addCharityPosition() {
      const organisation = await this.organisationLookup();

      const organisationUser = this.get(
        "organisationsUserService"
      ).getOrganisationUser(organisation.get("id"), this.get("model.id"));

      let params = organisationUser
        ? `id=${organisationUser.get("id")}`
        : `organisationId=${organisation.get("id")}`;

      this.transitionToRoute(
        `/users/${this.get("model.id")}/charity_position?${params}`
      );
    },

    viewCharityPosition(id) {
      this.transitionToRoute(
        `/users/${this.get("model.id")}/charity_position?id=${id}`
      );
    }
  }
});
