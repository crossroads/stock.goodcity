import Ember from "ember";
import _ from "lodash";
import { cached } from "../utils/cache";

// @todo: unify code and pacakge_type under 'package_type'
const MODEL_NAME = "code";

export default Ember.Service.extend({
  // ----- Services -----
  store: Ember.inject.service(),

  // ----- Methods -----

  init() {
    this.set("openPackageTypeSearch", false);
    this.set("packageTypeSearchOptions", {});
  },

  /**
   * Triggers the code selection popup, and resolves the promise
   * once a package type (or code) has been selected.
   *
   * null is returned if the user closes the UI
   *
   * @param {object} opts search options
   * @returns {Promise<Model>}
   */
  userPickPackageType(opts = {}) {
    const deferred = Ember.RSVP.defer();

    Ember.run(() => {
      this.set("packageTypeSearchOptions", opts);
      this.set("openPackageTypeSearch", true);
      this.set("onPackageTypeSelected", code => {
        this.set("onPackageTypeSelected", _.noop);
        this.set("openPackageTypeSearch", false);
        deferred.resolve(code || null);
      });
    });

    return deferred.promise;
  },

  preload: cached(async function() {
    return await this.get("store").query("code", { stock: true });
  }),

  parentsOf(packageType) {
    const hierarchy = this.get("hierarchy");
    const code = packageType.get("code");

    const node = hierarchy.refs[code];

    return _.uniq(
      _.flatten([
        packageType,
        ...node.parents.map(({ type }) => type),
        ...node.parents.map(({ type }) => this.parentsOf(type))
      ])
    );
  },

  // ----- Data -----

  _all: Ember.computed(function() {
    return this.get("store").peekAll(MODEL_NAME);
  }),

  /*
   * Tree tructure representing the package type hierarchy
   */
  hierarchy: Ember.computed("_all.[]", function() {
    const refs = {};

    const getOrCreateNode = (type, parent = null) => {
      const code = type.get("code");

      if (!refs[code]) {
        const node = {};
        refs[code] = node;
        node.type = type;
        node.nodes = type
          .allChildPackagesList()
          .map(t => getOrCreateNode(t, node));
      }

      refs[code].parents = refs[code].parents || [];
      if (
        parent &&
        parent != refs[code] &&
        !_.includes(refs[code].parents.parent)
      ) {
        refs[code].parents.push(parent);
      }

      return refs[code];
    };

    const allNodes = this.get("_all").map(type => getOrCreateNode(type));

    return {
      refs,
      roots: allNodes.filter(node => node.parents.length === 0)
    };
  })
});
