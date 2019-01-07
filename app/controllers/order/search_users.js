import Ember from "ember";
import searchModule from "./../search_module";
import AjaxPromise from 'stock/utils/ajax-promise';

export default searchModule.extend({
  minSearchTextLength: 3,

  onSearchTextChange: Ember.observer("searchText", function(){
    if(this.get('searchText').length){
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set("filteredResults", []);
    }
  }),

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > this.get("minSearchTextLength")) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      //if(this.get("unloadAll")) { this.get("store").unloadAll(); }

      this.infinityModel("user",
        { startingPage: 1, perPage: 25, modelPath: 'filteredResults', role_name: 'Charity' },
        { searchText: "searchText"}).then(data => {
          if(this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.get("store").pushPayload(data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        }).finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
    },

    goToRequestPurpose(userId) {
      let orderId = this.get('model.id');
      let orderParams = { created_by_id: userId };
      new AjaxPromise('/orders/'+orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(() => {
          this.transitionToRoute('order.request_purpose', orderId, { queryParams: { userId: userId }});
        });
    }
  }
});
