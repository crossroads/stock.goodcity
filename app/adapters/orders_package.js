import ApplicationAdapter from "./application";
import config from "../config/environment";

export default ApplicationAdapter.extend({
  urlForQuery: function({ slug }, modelName) {
    if (modelName === "orders-package" && slug) {
      return `${config.APP.API_HOST_URL}/${
        config.APP.NAMESPACE
      }/orders_packages/${slug}`;
    }
    return this._super(...arguments);
  }
});
