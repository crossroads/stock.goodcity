import Ember from "ember";
import AjaxPromise from "./../utils/ajax-promise";

/**
 * @module Services/ApiBaseService
 * @augments ember/Service
 * @description Base service class providing handy methods for API based services
 */
export default Ember.Service.extend({
  // ----- Services -----
  session: Ember.inject.service(),

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
   * @param {string} url the endpoint to fetch
   * @param {object} [options]
   * @param {boolean} [options.authorizedRequest] auth token presence (default=true)
   * @returns {Promise<any>}
   */
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

  /**
   * @param {string} url the endpoint to post to
   * @param {object} body the post payload
   * @param {object} [options]
   * @param {boolean} [options.authorizedRequest] auth token presence (default=true)
   * @returns {Promise<any>}
   */
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

  /**
   * @param {string} url the endpoint to put to
   * @param {object} body the data payload
   * @param {object} [options]
   * @param {boolean} [options.authorizedRequest] auth token presence (default=true)
   * @returns {Promise<any>}
   */
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

  /**
   * @param {string} url the endpoint to delete
   * @param {object} [options]
   * @param {boolean} [options.authorizedRequest] auth token presence (default=true)
   * @returns {Promise<any>}
   */
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
