import detail from "./detail";
import Ember from "ember";
import _ from "lodash";

export default detail.extend({
  enableFooterActions: false,

  groupedVersions() {
    let versions = this.get("model.versions").toArray();

    let results = _.map(versions, function(version) {
      return _.omit(version.get("objectChanges"), [
        "available_quantity",
        "designated_quantity",
        "on_hand_quantity",
        "dispatched_quanitity",
        "id",
        "detail_type_id",
        "created_at",
        "received_at"
      ]);
    });
    versions.forEach((version, index) =>
      version.set("objectChanges", results[index])
    );
    return versions;
  },

  getGroupKey(isAction, action) {
    const createdAt = moment(action.get("createdAt")).format("LL");
    if (isAction) {
      return `${action.get("user.fullName")}/${action.get(
        "action"
      )}/${createdAt}`;
    } else {
      return `${action.get("whodunnitName")}/${action.get(
        "state"
      )}/${createdAt}`;
    }
  },

  groupingAndSortingActions(actionsAndVersions) {
    const groups = _.reduce(
      actionsAndVersions,
      (results, action) => {
        const createdAt = moment(action.get("createdAt")).format("LL");
        const isItemAction = !!action.get("user.fullName");
        const groupKey = this.getGroupKey(isItemAction, action);

        results[groupKey] = results[groupKey] || {
          key: groupKey,
          type: isItemAction ? action.get("action").capitalize() : "Edited",
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
  },

  groupedActionsAndVersions: Ember.computed("model", "itemActions", function() {
    let actionsAndVersions = [
      ...this.get("itemActions").toArray(),
      ...this.groupedVersions().toArray()
    ].sortBy("createdAt");
    return this.groupingAndSortingActions(actionsAndVersions);
  })
});
