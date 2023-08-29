import Ember from "ember";
import config from "../config/environment";
import ActiveModelAdapter from "active-model-adapter";

export default ActiveModelAdapter.extend({
  namespace: config.APP.NAMESPACE,
  host: config.APP.API_HOST_URL,
  session: Ember.inject.service(),

  headers: Ember.computed("session.authToken", function() {
    return {
      Authorization: `Bearer ${this.get("session.authToken")}`,
      "Accept-Language": this.get("session.language"),
      "X-GOODCITY-APP-NAME": config.APP.NAME,
      "X-GOODCITY-APP-VERSION": config.APP.VERSION,
      "X-GOODCITY-APP-SHA": config.APP.SHA,
      "X-GOODCITY-DEVICE-ID": this.get("session.deviceId")
    };
  }),

  buildURL: function(modelName, id, snapshot, requestType) {
    if (modelName === "order" && requestType === "findAll") {
      return (
        config.APP.API_HOST_URL + "/" + config.APP.NAMESPACE + "/designations"
      );
    }
    return this._super(...arguments);
  },

  urlForFindRecord(id, modelName, opts) {
    if (modelName === "item") {
      Ember.set(arguments, "1", "stockit_item");
    }

    let url = this._super(...arguments);

    if (opts && opts.adapterOptions) {
      const queryString = new URLSearchParams(opts.adapterOptions).toString();

      if (/\?/.test(url)) {
        url += "&" + queryString;
      } else {
        url += "?" + queryString;
      }
    }

    return url;
  },

  urlForQuery(query, modelName) {
    if (modelName === "code") {
      Ember.set(arguments, "1", "package_type");
    }
    return this._super(...arguments);
  }
});
