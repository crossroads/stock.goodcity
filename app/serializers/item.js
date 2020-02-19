import applicationSerializer from "./application";

export default applicationSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    payload.offers_packages.map(op => {
      op.item_id = op.package_id;
      delete op.package_id;
    });
    return this._super(...arguments);
  }
});
