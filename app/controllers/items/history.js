import detail from "./detail";
import Ember from "ember";
import _ from "lodash";

export default detail.extend({
  enableFooterActions: false,

  groupedVersions() {
    let versions = this.get("versions").toArray();
    let results = _.map(versions, function(version) {
      return _.omit(version.get("objectChanges"), [
        "available_quantity",
        "designated_quantity",
        "on_hand_quantity",
        "dispatched_quanitity",
        "id",
        "detail_type_id",
        "created_at",
        "received_at",
        "offer_id",
        "detail_id",
        "dispatched_quantity",
        "updated_by_id",
        "sent_on"
      ]);
    });
    versions.forEach((version, index) =>
      version.set("objectChanges", results[index])
    );
    return versions.filter(
      version => Object.keys(version.get("objectChanges")).length > 1
    );
  },

  getGroupKey(isAction, action) {
    const createdAt = moment(action.get("createdAt")).format("LL");
    if (isAction) {
      return `${action.get("user.fullName")}/${action.get(
        "action"
      )}/${createdAt}`;
    }
    if (action.get("whodunnitName")) {
      return `${action.get("whodunnitName")}/${this.get(
        "model.state"
      )}/${createdAt}`;
    }
    return `${this.get("session.currentUser.fullName")}/${action.get(
      "state"
    )}/${createdAt}`;
  },

  groupingActionsAndVersions(actionsAndVersions) {
    const groups = _.reduce(
      actionsAndVersions,
      (results, action) => {
        const createdAt = moment(action.get("createdAt")).format("LL");
        const isItemAction = !!action.get("user.fullName");
        const groupKey = this.getGroupKey(isItemAction, action);

        const lastGroup = _.last(results);
        if (lastGroup && lastGroup.key === groupKey) {
          lastGroup.actions.push(action);
          return results;
        }

        const newGroup = {
          key: groupKey,
          type: isItemAction
            ? action.get("action").capitalize()
            : action.get("state") || "Edited",
          date: createdAt,
          user: isItemAction
            ? action.get("user.fullName")
            : action.get("whodunnitName") || action.get("updatedBy.fullName"),
          actions: [action]
        };
        results.push(newGroup);
        return results;
      },
      []
    );
    return groups;
  },

  groupedActionsAndVersions: Ember.computed(
    "model.detail",
    "model",
    "versions",
    "itemActions",
    function() {
      let actionsAndVersions = [
        ...this.get("itemActions").toArray(),
        ...this.groupedVersions().toArray(),
        ...this.get("model.ordersPackages").toArray()
      ]
        .sortBy("createdAt")
        .reverse();
      return this.groupingActionsAndVersions(actionsAndVersions);
    }
  )
});
