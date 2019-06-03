import Ember from "ember";
import AjaxPromise from "./../utils/ajax-promise";

export default Ember.Service.extend({
  // ----- Services -----
  session: Ember.inject.service(),

  // ----- Utilities -----
  _request(url, options, authorizedRequest) {
    const { action, params } = options;
    return new AjaxPromise(
      url,
      action,
      authorizedRequest ? this.get("session.authToken") : null,
      params
    );
  },

  // ----- CRUD ACTIONS -----
  /**
    authorizedRequest is optional parameter to be be sent during request.
    By default requests are authorized
  **/
  GET(url, opts = {}) {
    const { authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "GET"
      },
      authorizedRequest
    );
  },

  POST(url, opts = {}) {
    const { params, authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "POST",
        params
      },
      authorizedRequest
    );
  },

  PUT(url, opts = {}) {
    const { params, authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "PUT",
        params
      },
      authorizedRequest
    );
  },

  DELETE(url, opts = {}) {
    const { params, authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "DELETE",
        params
      },
      authorizedRequest
    );
  }
});
