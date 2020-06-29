import detail from "./detail";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default detail.extend(SearchMixin, {
  autoLoad: true,
  perPage: 25,

  getObjectPosition(objectToBeSearched, searchElement) {
    let position;
    Object.keys(objectToBeSearched).map(key => {
      if (objectToBeSearched[key].includes(searchElement)) {
        position = key;
      }
    });
    return position;
  },

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
        .then(items => {
          if (!items.get("length")) {
            return [];
          }
          let sortedItems = [...items.toArray()].sortBy("createdAt");
          const groups = _.reduce(
            sortedItems,
            (results, action) => {
              const groupKey = `${action.get("user.fullName")}/${action.get(
                "action"
              )}/${moment(action.get("createdAt")).format("LL")}`;
              results[groupKey] = results[groupKey] || {
                key: groupKey,
                type: action.get("action").capitalize(),
                date: moment(action.get("createdAt")).format("LL"),
                user: action.get("user.fullName"),
                actions: []
              };
              results[groupKey].actions.push(action);
              return results;
            },
            {}
          );
          return _.values(groups);
        });
    }
  }
});
