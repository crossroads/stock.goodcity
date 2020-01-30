import ApplicationAdapter from "./application";
import config from "../config/environment";

export default ApplicationAdapter.extend({
  urlForQuery: function(query, modelName) {
    return `${config.APP.API_HOST_URL}/${config.APP.NAMESPACE}/offers/search`;
  }
});
