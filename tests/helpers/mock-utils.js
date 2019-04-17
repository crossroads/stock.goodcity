import _ from "lodash";
import config from "../../config/environment";
import FactoryGuy from "ember-data-factory-guy";

class MockUtils {
  constructor() {
    $.mockjaxSettings.matchInRegistrationOrder = true;
  }

  startSession() {
    this.closeSession();
    $.mockjaxSettings.matchInRegistrationOrder = false;
    this.mocks = [];
  }

  closeSession() {
    if (this.mocks) {
      $.mockjaxSettings.matchInRegistrationOrder = true;
      _.each(this.mocks, $.mockjax.clear);
      this.mocks = null;
    }
  }

  mock(opts) {
    this.mocks.push($.mockjax(opts));
  }

  mockEmpty(modelName) {
    this.mocks.push(
      $.mockjax({
        url: `/api/v1/${modelName}*`,
        responseText: {
          [modelName + "s"]: []
        }
      })
    );
  }

  mockEmptyPreload() {
    _.each(config.APP.PRELOAD_TYPES, this.mockEmpty.bind(this));
  }

  mockDefault() {
    this.mockOrderSummary();
    this.mockUserProfile();
    this.mockEmptyPreload();
    this.mockEmpty("designation");
    this.mockEmpty("location");
  }

  mockOrderSummary() {
    this.mocks.push(
      $.mockjax({
        url: "/api/v1/orders/summar*",
        responseText: {
          submitted: 14,
          awaiting_dispatch: 1,
          dispatching: 1,
          processing: 2,
          priority_submitted: 14,
          priority_dispatching: 1,
          priority_processing: 2,
          priority_awaiting_dispatch: 1
        }
      })
    );
  }

  mockUserProfile() {
    const user = {
      id: _.uniqueId(),
      first_name: "John",
      last_name: "Dara51",
      mobile: "Lennon",
      user_role_ids: [1]
    };
    this.mocks.push(
      $.mockjax({
        url: "/api/v1/auth/current_user_profil*",
        responseText: {
          user_profile: [user],
          users: [_.pick(user, "id", "first_name", "last_name", "mobile")],
          roles: [{ id: 4, name: "Supervisor" }],
          user_roles: [{ id: 1, user_id: user.id, role_id: 4 }]
        }
      })
    );
  }
}

export default new MockUtils();
