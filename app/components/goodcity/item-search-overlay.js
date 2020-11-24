import Ember from "ember";
import _ from "lodash";
import config from "stock/config/environment";
import SearchMixin from "stock/mixins/search_resource";
import AsyncMixin from "stock/mixins/async";
import { chain } from "../../utils/async";
import { callbackObserver } from "../../utils/ember";

export default Ember.Component.extend(SearchMixin, AsyncMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  displayResults: false,
  perPage: 10,
  isMobileApp: config.cordova.enabled,
  packageService: Ember.inject.service(),
  cordova: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  requireFocus: false,

  inputmode: Ember.computed("searchMode", function() {
    if (this.get("searchMode") === "numeric") {
      return "numeric";
    }
    return "text";
  }),

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  openStateListener: callbackObserver("open", [
    [true, "onOpen"],
    [false, "onClose"]
  ]),

  closeOverlay() {
    this.setProperties({
      searchText: "",
      open: false,
      displayResults: false,
      onSelect: null
    });
  },

  getAllowedStates() {
    const states = this.getWithDefault("packageStates", []);

    if (!states || !states.length) {
      return null;
    }

    return _.flatten([states]).join(",");
  },

  async onOpen() {
    const platform = this.get("cordova");
    const scrollFix = platform.isIOS() || platform.isIOSBrowser();

    await chain.stagerred([
      () => this.set("requireFocus", true),
      () => scrollFix && window.scrollTo(0, 0)
    ]);
  },

  onClose() {
    this.set("requireFocus", false);
  },

  actions: {
    cancel() {
      this.closeOverlay();
    },

    setScannedSearchText(searchedText) {
      this.set("searchText", searchedText);
    },

    selectItem(item) {
      this.get("onConfirm")(item);
      this.closeOverlay();
    },

    clearSearch() {
      this.set("searchText", "");
    },

    async loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getSearchQuery(true),
          this.getPaginationQuery(pageNo),
          {
            associated_package_types: this.get("associatedPackageTypes"),
            withInventoryNumber: true,
            storage_type_name: this.get("storageTypeName"),
            states: this.getAllowedStates()
          }
        )
      );
      return this.get("store").query("item", params);
    }
  }
});
