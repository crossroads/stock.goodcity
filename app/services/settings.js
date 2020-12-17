import Ember from "ember";
import _ from "lodash";

const NOT_EMPTY = val => val && val.length > 0;
const TO_STRING = val => String(val);
const TO_ARRAY = val => {
  return val.trim().split(/\s*,\s*/);
};
const TO_NUMBER = val => Number(val);
const IS_NUMBER = val => !isNaN(TO_NUMBER(val));
const TO_BOOL = val => {
  if (_.isString(val)) {
    return /^true$/i.test(val);
  }
  return Boolean(val);
};

/**
 * @module Services/SettingsService
 * @augments ember/Service
 * @description Settings are loaded from the API in order to configure the behaviour of the app remotely.
 */
export default Ember.Service.extend({
  store: Ember.inject.service(),

  /**
   * @property {object} defaults Local pre-configured values
   * @readonly
   * @description
   * <br>
   * <br> Any key defined on the backend will override the local values
   * <br>
   * <br> A local value *must* be defined, the service will throw an error
   * <br> otherwise.
   * <br> This behaviour is meant to ensure we have fallback values if the remote config is missing.
   * <br> Add any new configuration keys here
   */
  defaults: {
    "stock.allow_partial_operations": false,
    "stock.only_publish_singletons": true,
    "stock.only_designate_singletons": true,
    "stock.enable_box_pallet_creation": false,
    "stock.allow_item_actions": true,
    "stock.allow_box_pallet_item_addition": false,
    "stock.params_not_to_be_copied": "serialNum"
  },

  /**
   * @property {Computed<boolean>} allowPartialOperations whether partial operations are allowed
   */
  allowPartialOperations: Ember.computed(function() {
    return this.readBoolean("stock.allow_partial_operations");
  }),

  /**
   * @property {Computed<boolean>} onlyDesignateSingletons prevents multi-qty items from being designated
   */
  onlyDesignateSingletons: Ember.computed(function() {
    return this.readBoolean("stock.only_designate_singletons");
  }),

  /**
   * @property {Computed<boolean>} onlyPublishSingletons prevents multi-qty items from being published
   */
  onlyPublishSingletons: Ember.computed(function() {
    return this.readBoolean("stock.only_publish_singletons");
  }),

  /**
   * @property {Computed<boolean>} disableBoxPalletCreation disables box pallet creation
   */
  disableBoxPalletCreation: Ember.computed(function() {
    return !this.readBoolean("stock.enable_box_pallet_creation");
  }),

  /**
   * @property {Computed<boolean>} allowItemActions whether item actions are allowed
   */
  allowItemActions: Ember.computed(function() {
    return this.readBoolean("stock.allow_item_actions");
  }),

  /**
   * @property {Computed<boolean>} disableBoxPalletItemAddition disables box pallet addition
   */
  disableBoxPalletItemAddition: Ember.computed(function() {
    return !this.readBoolean("stock.allow_box_pallet_item_addition");
  }),

  /**
   * @property {Computed<string>} paramsNotCopied lists params not to be copied during duplicate items
   */
  paramsNotCopied: Ember.computed(function() {
    return this.readArray("stock.params_not_to_be_copied");
  }),
  // ---- Access methods

  /**
   * Reads the property by its key and returns a boolean
   *
   * @param {string} key the settings key
   * @returns {boolean} whether the field is enabled or not
   */
  readBoolean(key) {
    return this.__readValue(key, {
      parser: TO_BOOL
    });
  },

  /**
   * Reads the property by its key and returns a string
   *
   * @param {string} key the settings key
   * @returns {array} the string of the setting keys in array form
   */
  readArray(key) {
    return this.__readValue(key, {
      parser: TO_ARRAY
    });
  },

  /**
   * Reads the property by its key and returns a string
   *
   * @param {string} key the settings key
   * @returns {string} the settings value
   */
  readString(key) {
    return this.__readValue(key, {
      parser: TO_STRING,
      validator: NOT_EMPTY
    });
  },

  /**
   * Reads the property by its key and returns a number
   *
   * @param {string} key the settings key
   * @returns {number} the number value
   */
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
