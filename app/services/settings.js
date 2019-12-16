import Ember from "ember";
import _ from "lodash";

const NOT_EMPTY = val => val && val.length > 0;
const TO_STRING = val => String(val);
const TO_NUMBER = val => Number(val);
const IS_NUMBER = val => !isNaN(TO_NUMBER(val));
const TO_BOOL = val => {
  if (_.isString(val)) {
    return /^true$/i.test(val);
  }
  return Boolean(val);
};

export default Ember.Service.extend({
  store: Ember.inject.service(),

  /**
   *
   * Settings are loaded from the API in order to configure the
   * behaviour of the app remotely.
   * Any key defined on the backend will override the local values
   *
   * A local value *must* be defined, the service will throw an error
   * otherwise. This behaviour is meant to ensure we have fallback values
   * if the remote config is missing
   *
   *
   * Add any new configuration keys below
   *         ;;;;;
   *         ;;;;;
   *       ..;;;;;..
   *        ':::::'
   *          ':`
   */
  defaults: {
    "stock.allow_partial_operations": false,
    "stock.only_publish_singletons": true,
    "stock.only_designate_singletons": true,
    "stock.enable_box_pallet_creation": false
  },

  allowPartialOperations: Ember.computed(function() {
    return this.readBoolean("stock.allow_partial_operations");
  }),

  onlyDesignateSingletons: Ember.computed(function() {
    return this.readBoolean("stock.only_designate_singletons");
  }),

  onlyPublishSingletons: Ember.computed(function() {
    return this.readBoolean("stock.only_publish_singletons");
  }),

  disableBoxPalletCreation: Ember.computed(function() {
    return !this.readBoolean("stock.enable_box_pallet_creation");
  }),

  // ---- Access methods

  readBoolean(key) {
    return this.__readValue(key, {
      parser: TO_BOOL
    });
  },

  readString(key) {
    return this.__readValue(key, {
      parser: TO_STRING,
      validator: NOT_EMPTY
    });
  },

  readNumber(key) {
    return this.__readValue(key, {
      parser: TO_NUMBER,
      validator: IS_NUMBER
    });
  },

  // ---- Helpers

  __validate(val, validator) {
    const validators = _.compact(_.flatten([validator]));
    return _.every(validators, fn => fn(val));
  },

  __assertExists(key) {
    const defaults = this.get("defaults");
    if (_.has(defaults, key)) {
      return;
    }

    throw new Error(`
      Settings '${key}' has not been defined locally.
      Please define a local default value before using it
    `);
  },

  __readValue(key, options = {}) {
    const defaults = this.get("defaults");
    const { validator, parser = _.identity } = options;

    this.__assertExists(key);

    const record = this.get("store")
      .peekAll("goodcity_setting")
      .findBy("key", key);

    const val = record && record.get("value");
    if (val && this.__validate(val, validator)) {
      return parser(val);
    }
    return parser(defaults[key]);
  }
});
