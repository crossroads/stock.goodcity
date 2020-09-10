import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  queryParams: {
    id: {
      refreshModel: true
    },
    organisationId: {
      refreshModel: true
    }
  },
  organisationsUserService: Ember.inject.service(),

  async model(params) {
    if (params.id) {
      return (
        this.store.peekRecord("organisations_user", params.id) ||
        (await this.store.findRecord("organisations_user", params.id, {
          reload: true
        }))
      );
    } else {
      return this.store.createRecord("organisations_user", {
        position: "",
        preferredContactNumber: "",
        organisationId: "",
        user_id: "",
        status: ""
      });
    }
  },

  async beforeModel(transition) {
    const userId = transition.params["users.charity_position"].user_id;
    this.set("user_id", userId);
    this.store.peekRecord("user", userId) ||
      (await this.store.findRecord("user", userId, {
        reload: true
      }));
  },

  async afterModel(_model, transition) {
    const organisationId = transition.queryParams["organisationId"];
    if (organisationId) {
      this.set("organisation_id", organisationId);
      this.store.peekRecord("gc_organisation", organisationId) ||
        (await this.store.findRecord("gc_organisation", organisationId, {
          reload: true
        }));
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("user_id", this.get("user_id"));
    this.initializeStatus(controller, model);
    this.initializeOrganisation(controller, model);
  },

  initializeOrganisation(controller, model) {
    const data =
      model.get("organisation") ||
      this.store.peekRecord("gc_organisation", this.get("organisation_id"));
    controller.set("organisation", data);
    if (!model.get("organisation.id")) {
      model.set(
        "organisation",
        this.store.createRecord("organisation", {
          nameEn: data.get("nameEn"),
          id: data.get("id")
        })
      );
    }
  },

  async initializeStatus(controller, model) {
    const data = await this.get("organisationsUserService").getAllStatus();
    controller.set("allStatus", data);
    if (!model.get("status")) {
      controller.set("selectedStatus", data[0]);
      return;
    }

    const selected = data.find(
      d => d.name.toLowerCase() === model.get("status")
    );
    controller.set("selectedStatus", selected);
  }
});
