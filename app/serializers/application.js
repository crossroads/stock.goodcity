import { ActiveModelSerializer } from "active-model-adapter";
import _ from "lodash";

// @TODO: rename the item model into package and remove those aliases
const ALIASES = {
  package: "item",
  packages: "items"
};

function normalize(payload) {
  _.each(ALIASES, (alias, original) => {
    if (_.has(payload, original)) {
      payload[alias] = payload[original];
      delete payload[original];
    }
  });
}

export default ActiveModelSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    normalize(payload);
    return this._super(...arguments);
  },

  pushPayload(store, payload) {
    normalize(payload);
    return this._super(...arguments);
  }
});
