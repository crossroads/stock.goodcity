import Ember from "ember";
import config from "stock/config/environment";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select an offer.
 *
 * The popup *does not* do anythinng to the offer apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an offer is selected
 */
export default Ember.Component.extend(SearchMixin, {
  autoLoad: true,
  store: Ember.inject.service(),
  scanSearch: false,
  offerService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  perPage: 25,
  isMobileApp: config.cordova.enabled,
  offer_state: {
    state: "received"
  },
  searchText: "",

  actions: {
    clearSearch() {
      this.set("searchText", "");
    },

    loadMoreOffers(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {
            companies: true,
            slug: "search",
            is_desc: true,
            sort_column: "reviewed_at"
          },
          this.get("offer_state"),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("offer", params)
        .then(offers => {
          if (
            this.get("isMobileApp") &&
            offers.get("length") == 1 &&
            this.get("scanSearch")
          ) {
            this.send("selectOffer", offers.get("firstObject"));
          }
          this.set("scanSearch", false);
          return offers;
        });
    },

    closeOverlay() {
      this.set("scanSearch", false);
      this.send("selectOffer", null);
    },

    selectOffer(offer) {
      this.getWithDefault("onSelect", _.noop)(offer);
      this.set("scanSearch", false);
      this.set("open", false);
    },

    setScannedSearchText(searchedText) {
      this.set("searchText", searchedText);
      this.set("scanSearch", true);
    }
  }
});
