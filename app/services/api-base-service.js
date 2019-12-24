import Service, { inject as service } from "@ember/service";
import AjaxPromise from "./../utils/ajax-promise";

export default Service.extend({
  // ----- Services -----
  session: service(),

  // ----- Utilities -----
  _request(url, options, authorizedRequest) {
    const { action, body } = options;
    return new AjaxPromise(
      url,
      action,
      authorizedRequest ? this.get("session.authToken") : null,
      body
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

  POST(url, body, opts = {}) {
    const { authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "POST",
        body
      },
      authorizedRequest
    );
  },

  PUT(url, body, opts = {}) {
    const { authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "PUT",
        body
      },
      authorizedRequest
    );
  },

  DELETE(url, opts = {}) {
    const { authorizedRequest = true } = opts;
    return this._request(
      url,
      {
        action: "DELETE"
      },
      authorizedRequest
    );
  }
});
