import Ember from "ember";
import searchModule from "./../search_module";
import AjaxPromise from "stock/utils/ajax-promise";
import { ORGANISATION_STATUS } from "../../constants/states";

const { pending, approved } = ORGANISATION_STATUS;

export default searchModule.extend({
  filteredResults: "",
  queryParams: ["prevPath"],
  prevPath: null,

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set("filteredResults", []);
    }
  }),

  applyFilter() {
    this.set("isLoading", true);
    this.set("hasNoResults", false);

    this.infinityModel(
      "user",
      {
        startingPage: 1,
        perPage: 25,
        modelPath: "filteredResults",
        organisation_status: `${approved},${pending}`
      },
      { searchText: "searchText" }
    )
      .then(data => {
        if (this.get("searchText") === data.meta.search) {
          data.forEach(user => {
            user.get("organisations_users_ids").forEach(org_user_id => {
              this.findOrganisationsUser(org_user_id);
            });
          });

          this.set("filteredResults", data);
          this.get("store").pushPayload(data);
          this.set("hasNoResults", data.get("length") === 0);
        }
      })
      .finally(() => this.set("isLoading", false));
    this.set("filteredResults", []);
  },

  findOrganisationsUser(org_user_id) {
    return this.store.findRecord("organisations_user", org_user_id, {
      reload: false
    });
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
    },

    goToRequestPurpose(user) {
      const orderId = this.get("model.order.id");
      const userId = user.get("id");
      const organisation_id = user.get(
        "organisationsUsers.firstObject.organisation.id"
      );
      const orderParams = { created_by_id: userId, organisation_id };
      new AjaxPromise(
        "/orders/" + orderId,
        "PUT",
        this.get("session.authToken"),
        { order: orderParams }
      ).then(data => {
        this.store.pushPayload(data);
        if (this.get("prevPath") === "contact_summary") {
          this.transitionToRoute("orders.contact_summary", orderId);
        } else {
          this.transitionToRoute("order.request_purpose", orderId, {
            queryParams: { userId: userId }
          });
        }
      });
    }
  }
});
