import detail from "./detail";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default detail.extend(SearchMixin, {
  enableFooterActions: false,
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
        .then(items => {
          if (!items.get("length")) {
            return [];
          }
          let versions = items
            .get("firstObject")
            .get("item.versions")
            .toArray();

          let results = _.map(versions, function(version) {
            return _.omit(version.get("objectChanges"), [
              "available_quantity",
              "designated_quantity",
              "on_hand_quantity",
              "dispatched_quanitity"
            ]);
          });
          versions.forEach((version, index) =>
            version.set("objectChanges", results[index])
          );
          versions.shift();
          let actionsAndVersions = [...items.toArray(), ...versions].sortBy(
            "createdAt"
          );
          const groups = _.reduce(
            actionsAndVersions,
            (results, action) => {
              let groupKey;
              const createdAt = moment(action.get("createdAt")).format("LL");
              const isItemAction = !!action.get("user.fullName");

              if (isItemAction) {
                groupKey = `${action.get("user.fullName")}/${action.get(
                  "action"
                )}/${createdAt}`;
              } else {
                groupKey = `${action.get("whodunnitName")}/${action.get(
                  "state"
                )}/${createdAt}`;
              }

              results[groupKey] = results[groupKey] || {
                key: groupKey,
                type: isItemAction
                  ? action.get("action").capitalize()
                  : "Edited",
                date: createdAt,
                user: isItemAction
                  ? action.get("user.fullName")
                  : action.get("whodunnitName"),
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
