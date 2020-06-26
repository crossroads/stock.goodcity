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
          let groupedUserItems = [];
          let actionsAndVersions = [...items.toArray()];
          let sortedItems = actionsAndVersions.sortBy("createdAt");

          sortedItems.map((item, index) => {
            let previousItem = sortedItems[index - 1];
            if (
              item.get("user.fullName").toString() ==
              (previousItem && previousItem.get("user.fullName").toString())
            ) {
              const existingKey = this.getObjectPosition(
                groupedUserItems,
                previousItem
              );
              groupedUserItems[existingKey].push(item);
            } else {
              const newKey = `${item.get("user.fullName")}_${index}`;
              groupedUserItems[newKey] = [item];
            }
          });
          return [groupedUserItems];
        });
    }
  }
});
