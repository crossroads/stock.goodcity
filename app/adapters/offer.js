import ApplicationAdapter from "./application";
import config from "../config/environment";
import { pluralize } from "ember-inflector";

export default ApplicationAdapter.extend({
  urlForQuery: function(query, modelName) {
    const { NAMESPACE, API_HOST_URL } = config.APP;
    const { slug } = query;
    if (slug) {
      return `${API_HOST_URL}/${NAMESPACE}/${pluralize(modelName)}/${slug}`;
    }
    return this._super(...arguments);
  }
});
