import ApplicationAdapter from "./application";
import config from "stock/config/environment";
import { pluralize } from "ember-inflector";

export default ApplicationAdapter.extend({
  coalesceFindRequests: true,

  urlForQuery: function(query, modelName) {
    const { slug, organisationId } = query;
    const { NAMESPACE, API_HOST_URL } = config.APP;

    if (slug && organisationId) {
      delete query.organisationId;
      delete query.slug;
      return `${API_HOST_URL}/${NAMESPACE}/${pluralize(
        modelName
      )}/${organisationId}/${slug}`;
    } else if (slug) {
      return `${API_HOST_URL}/${NAMESPACE}/${pluralize(modelName)}/${slug}`;
    } else {
      return this._super(...arguments);
    }
  }
});
