import ApplicationAdapter from "./application";
import _ from "lodash";

export default ApplicationAdapter.extend({
  // Intercept the update method of designations, to send the data with the 'order' name instead
  updateRecord(store, type, snapshot) {
    let data = this.serialize(snapshot, { includeId: true });
    const url = this.buildURL("order", snapshot.id, snapshot, "updateRecord");
    return this.ajax(url, "PUT", { data: { order: data } });
  },

  //For contstructing /show endpoint with queryParams for designations
  urlForFindRecord(id, modelName, snapshot) {
    const params = {
      include_packages: false,
      include_order: true,
      include_orders_packages: false,
      include_messages: true
    };
    let baseUrl = this.buildURL(modelName, id, snapshot);
    const paramStr = _.map(params, (value, key) => `${key}=${value}`).join("&");
    return `${baseUrl}?${paramStr}`;
  }
});
