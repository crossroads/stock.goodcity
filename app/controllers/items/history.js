import detail from "./detail";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default detail.extend(SearchMixin, {
  autoLoad: true,
  perPage: 25,

  actions: {
    loadMoreActions(pageNo) {
      const params = this.trimQuery(
        _.merge(
          { package_id: this.get("model.id") },
          this.getPaginationQuery(pageNo)
        )
      );
      return this.get("store")
        .query("item_action", params)
        .then(results => {
          return results;
        });
    }
  }
});
