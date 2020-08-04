import { ActiveModelSerializer } from "active-model-adapter";
import _ from "lodash";
import { times } from "../utils/helpers";

const ALIASES = {
  // @TODO: rename the item model into package and remove those aliases
  package: "item",
  packages: "items"
};

const KEY_MAPPINGS = {
  package: {
    package_type_id: "code_id"
  },
  stocktake_revision: {
    package_id: "item_id"
  }
};

/**
 * Returns the records found in the payload for a specific type
 *
 * @param {object} payload
 * @param {string} modelName
 */
function readRecords(payload, modelName) {
  return _.flatten([
    _.get(payload, modelName),
    _.get(payload, `${modelName}s`)
  ]).filter(_.identity);
}

/**
 * Renames keys of the payload to match the expected model names
 *
 * @param {object} payload
 */
function normalizeModelNames(payload) {
  _.each(ALIASES, (alias, original) => {
    if (_.has(payload, original)) {
      payload[alias] = payload[original];
    }
  });
}

/**
 * Normalizes messages before
 *
 * @param {object} payload
 */
function normalizeMessages(payload) {
  const messages = readRecords(payload, "message");

  _.each(messages, m => {
    if (m.messageable_type == "Order") {
      m.designation_id = m.messageable_id;
    }

    // This is done to handle inconsistent mapping of jsonb datatype
    if (typeof m.lookup === "object") {
      m.lookup = JSON.stringify(m.lookup);
    }
  });
}

/**
 * Maps record keys, e.g transform package_id into item_id
 *
 * @param {object} payload
 */
function normalizeKeys(payload) {
  _.each(KEY_MAPPINGS, (mapping, modelName) => {
    const keysToMap = _.keys(mapping);
    const records = readRecords(payload, modelName);

    times(keysToMap, records, (key, record) => {
      if (_.has(record, key)) {
        record[mapping[key]] = record[key];
        delete record[key];
      }
    });
  });
}

function normalize(payload) {
  if (!payload) return;

  normalizeKeys(payload);
  normalizeModelNames(payload);
  normalizeMessages(payload);
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
