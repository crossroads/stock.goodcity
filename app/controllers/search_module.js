import Ember from "ember";
import _ from "lodash";
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Controller.extend(InfinityRoute, {
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),
  getCurrentUser: Ember.computed(function() {
    var store = this.get("store");
    var currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  sanitizeString(str) {
    // these are the special characters '.,)(@_-' that are allowed for search
    // '\.' => will allow '.'
    // '\(' => will allow '('
    // '\@' => will allow '@'
    // '\)' => will allow ')'
    str = str.replace(/[^a-z0-9áéíóúñü \.,\)\(@_-]/gim, "");
    return str.trim();
  },

  searchText: Ember.computed("searchInput", {
    get() {
      return this.get("searchInput") || "";
    },

    set(key, value) {
      return this.sanitizeString(value);
    }
  }),

  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  isLoading: false,
  hasNoResults: false,
  itemSetId: null,
  unloadAll: false,
  minSearchTextLength: 0,
  searchInput: null,
  toDesignateItem: null,
  excludeAssociations: true,
  requestOptions: {},
  modelPath: "filteredResults",

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  canSearch: Ember.computed("searchText", function() {
    return this.get("searchText").length > this.get("minSearchTextLength");
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    if (this.get("canSearch")) {
      this.set("itemSetId", null);
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set(this.get("modelPath"), []);
    }
  }),

  buildQueryParamMap() {
    let queryParamDefinitions = {
      itemId: "itemSetId",
      toDesignateItem: "toDesignateItem",
      shallow: "excludeAssociations"
    };

    if (this.get("hasSearchText")) {
      queryParamDefinitions.searchText = "searchText";
    }

    for (var key in this.requestOptions) {
      queryParamDefinitions[key] = `requestOptions.${key}`;
    }
    return queryParamDefinitions;
  },

  onFilterChange(opts) {
    const { force = false } = opts;
    if (force || this.get("canSearch")) {
      this.set("itemSetId", null);
      Ember.run.debounce(this, () => this.applyFilter(opts), 500);
    }
  },

  beforeSearch() {
    if (this.get("unloadAll")) {
      _.each(["designation", "item", "location", "code"], m => {
        this.get("store").unloadAll(m);
      });
    }
  },

  afterSearch() {
    // To be implemented
  },

  createFilterParams() {
    // Default params, to be overriden in subclass
    return {
      perPage: 25,
      startingPage: 1,
      modelPath: this.get("modelPath"),
      stockRequest: true
    };
  },

  applyFilter(opts = {}) {
    const { force = false } = opts;
    const modelPath = this.get("modelPath");
    const searchText = this.get("searchText");
    if (force || this.get("canSearch")) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      this.set("forceLoading", force);
      this.beforeSearch();

      this.infinityModel(
        this.get("searchModelName"),
        this.createFilterParams(),
        this.buildQueryParamMap()
      )
        .then(data => {
          return Ember.RSVP.resolve(this.afterSearch(data)).then(() => data);
        })
        .then(data => {
          if (force || this.get("searchText") === data.meta.search) {
            this.set(modelPath, data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set(modelPath, []);
  },

  afterInfinityModel(records) {
    var searchText = this.get("searchText");
    if (this.get("forceLoading")) {
      return;
    }
    if (searchText.length === 0 || searchText !== records.meta.search) {
      records.replaceContent(0, 25, []);
    }
  },

  actions: {
    clearSearch() {
      this.set("searchText", "");
    }
  }
});
