import ApplicationAdapter from "./application";
import config from "stock/config/environment";

export default ApplicationAdapter.extend({
  urlForQuery(query, modelName) {
    const { NAMESPACE, API_HOST_URL } = config.APP;
    return `${API_HOST_URL}/${NAMESPACE}/packages_inventories`;
  }
});
