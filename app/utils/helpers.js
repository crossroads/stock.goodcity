import _ from "lodash";

/**
 *
 * @export
 * @param {Model|string} modelOrId
 * @returns {string}
 */
export function toID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}

/**
 * Will the func method for each element of setA against each element of setB
 *
 * @export
 * @param {Array} setA
 * @param {Array} setB
 * @param {Function} func
 */
export function times(setA, setB, func) {
  for (const it1 of setA) {
    for (const it2 of setB) {
      func(it1, it2);
    }
  }
}

export const url = {
  /**
   * Return true if the string is a valid URL
   *
   * @param {string} str
   * @returns {boolean}
   */
  isUrl(str) {
    return /^https?:\/\//.test(str);
  },

  /**
   * Returns the value of a query param
   *
   * @param {string} url
   * @param {string} param
   * @returns {string}
   */
  readQueryParam(url, param) {
    const idx = url.indexOf("?");
    const params = idx >= 0 ? url.slice(idx + 1).split("&") : [];

    const pair = params.map(p => p.split("=")).find(([k, v]) => k === param);

    return pair ? pair[1] : null;
  },

  /**
   * Returns the path of the url, without the domain name or query params
   *
   * @param {string} url
   * @returns {string}
   */
  pathname(url) {
    return url.replace(/\?.*$/, "").replace(/^(https?:\/\/)?[^\/]*\//, "/");
  }
};
