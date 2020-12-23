import _ from "lodash";
import config from "../../config/environment";
import FactoryGuy from "ember-data-factory-guy";

function toJSON(record) {
  if (_.isFunction(record.toJSON)) {
    return record.toJSON({ includeId: true });
  }
  return record;
}

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
    this.user = null;
  }

  getSessionUser() {
    return this.user;
  }

  mock(opts) {
    this.mocks.push($.mockjax(opts));
  }

  mockEmpty(modelName) {
    return this.mockWithRecords(modelName, []);
  }

  mockWithRecords(modelName, records = []) {
    this.mocks.push(
      $.mockjax({
        url: `/api/v1/${modelName}*`,
        responseText: {
          [modelName + "s"]: _.map(records, toJSON)
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
    this.mockEmpty("order_transport");
  }

  mockDonorConditions() {
    this.mockWithRecords("donor_condition", [
      { id: 1, name: "New" },
      { id: 2, name: "Lightly Used" },
      { id: 3, name: "Heavily Used" },
      { id: 4, name: "Broken" }
    ]);
  }

  mockProcessingDestinations() {
    this.mockWithRecords("processing_destination", [
      { id: 1, name: "Clothing" },
      { id: 2, name: "IT Department" }
    ]);
  }

  mockOrderSummary(data = {}) {
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
          priority_awaiting_dispatch: 1,
          ...data
        }
      })
    );
  }

  mockUserProfile(userProfile = {}, opts = {}) {
    const { role = "Supervisor" } = opts;
    this.user = {
      id: 100 + _.uniqueId(),
      first_name: "John",
      last_name: "Lennon",
      mobile: "91111111",
      user_role_ids: [1],
      ...userProfile
    };
    this.mocks.push(
      $.mockjax({
        url: "/api/v1/auth/current_user_profil*",
        responseText: {
          user_profile: [this.user],
          users: [_.pick(this.user, "id", "first_name", "last_name", "mobile")],
          roles: [{ id: 4, name: role }],
          user_roles: [{ id: 1, user_id: this.user.id, role_id: 4 }],
          permissions: [{ id: 1, name: "can_manage_orders" }],
          role_permissions: [{ id: 1, role_id: 4, permission_id: 1 }]
        }
      })
    );
  }
}

export default new MockUtils();
