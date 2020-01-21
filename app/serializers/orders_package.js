import applicationSerializer from "./application";

export default applicationSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    payload["item"] = payload["packages"];
    delete payload.packages;
    return this._super(...arguments);
  }
});
