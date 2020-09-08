import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  queryParams: {
    id: {
      refreshModel: true
    }
  },
  organisationsUserService: Ember.inject.service(),

  async model(params) {
    if (params.id) {
      const model =
        this.store.peekRecord("organisations_user", params.id) ||
        (await this.store.findRecord("organisations_user", params.id, {
          reload: true
        }));
      return model;
    }
  },

  beforeModel(transition) {
    const userId = transition.params["users.charity_position"].user_id;
    this.set("user_id", userId);
    this.store.peekRecord("user", userId) ||
      this.store.findRecord("user", userId, {
        reload: true
      });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("user_id", this.get("user_id"));

    this.initializeStatus(controller, model);
    this.initializeOrganisation(controller, model);
    this.initializePosition(controller, model);
    this.initializePhoneNumber(controller, model);
  },

  initializeOrganisation(controller, model) {
    const data = model ? model.get("organisation") : "";
    controller.set("organisation", data);
  },

  initializePosition(controller, model) {
    const data = model ? model.get("position") : "";
    controller.set("position", data);
  },

  initializePhoneNumber(controller, model) {
    const data = model ? model.get("preferredContactNumber") : "";
    controller.set("preferredContactNumber", data);
  },

  async initializeStatus(controller, model) {
    let data = await this.get("organisationsUserService").getAllStatus();
    data = data["status"].map((val, index) => ({ id: index, name: val }));
    controller.set("allStatus", data);

    if (!model) {
      controller.set("selectedStatus", data[0]);
      return;
    }
    debugger;
    const selected = data.find(d => d.name === model.get("status"));
    controller.set("selectedStatus", selected);
  }
});
