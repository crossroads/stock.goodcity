import ApplicationAdapter from "./application";
import config from "../config/environment";
import { pluralize } from "ember-inflector";

export default ApplicationAdapter.extend({
  urlForQuery: function({ slug }, modelName) {
    const { NAMESPACE, API_HOST_URL } = config.APP;
    if (slug) {
      return `${API_HOST_URL}/${NAMESPACE}/${pluralize(modelName)}/${slug}`;
    }
    return this._super(...arguments);
  }
});
