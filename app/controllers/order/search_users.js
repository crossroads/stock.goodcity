import Ember from "ember";
import searchModule from "./../search_module";
import AjaxPromise from "stock/utils/ajax-promise";

import { ORGANISATION_USER_STATUS } from "../../constants/states";

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
        organisation_status: `${(ORGANISATION_USER_STATUS.pending,
        ORGANISATION_USER_STATUS.approved)}`
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

    goToRequestPurpose(userId) {
      let orderId = this.get("model.order.id");
      let orderParams = { created_by_id: userId };
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
