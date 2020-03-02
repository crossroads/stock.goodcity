import applicationSerializer from "./application";

// @TODO: delete this serializer after renaming item to package
export default applicationSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (payload.offers_packages) {
      payload.offers_packages.map(op => {
        op.item_id = op.package_id;
        delete op.package_id;
      });
    }
    return this._super(...arguments);
  }
});
