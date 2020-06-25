import ApplicationAdapter from "./application";
import _ from "lodash";
import config from "stock/config/environment";

export default ApplicationAdapter.extend({
  urlForQuery(query, modelName) {
    const { NAMESPACE, API_HOST_URL } = config.APP;
    const paramStr = _.map(query, (value, key) => `${key}=${value}`).join("&");
    return `${API_HOST_URL}/${NAMESPACE}/packages_inventories?${paramStr}`;
  }
});
