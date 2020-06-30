import applicationSerializer from "./application";
import _ from "lodash";

// @TODO: delete this serializer after renaming item to package
export default applicationSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (payload.versions) {
      let results = _.map(payload.versions, o =>
        _.omit(o.object_changes, [
          "available_quantity",
          "designated_quantity",
          "on_hand_quantity",
          "dispatched_quanitity"
        ])
      );
      let final = _.mergeWith(
        payload.versions,
        results,
        (firstObject, lastObject) => {
          if (firstObject.object_changes) {
            firstObject.object_changes = lastObject;
            return firstObject;
          }
        }
      );
    }
    if (payload.offers_packages) {
      payload.offers_packages.map(op => {
        op.item_id = op.package_id;
        delete op.package_id;
      });
    }
    return this._super(...arguments);
  }
});
