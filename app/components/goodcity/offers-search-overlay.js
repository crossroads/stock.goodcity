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
  offerService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  perPage: 25,
  isMobileApp: config.cordova.enabled,
  offer_state: {
    state: "received"
  },

  actions: {
    loadMoreOffers(pageNo) {
      const singleOfferWarning = this.get("i18n").t(
        "search_offer.offer_select_warning"
      );
      const params = this.trimQuery(
        _.merge(
          {
            companies: true,
            slug: "search"
          },
          this.get("offer_state"),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("offer", params)
        .then(offers => {
          if (this.get("isMobileApp") && offers.get("length") == 1) {
            this.get("messageBox").custom(
              singleOfferWarning,
              "Yes",
              () => {
                this.send("selectOffer", offers.get("firstObject"));
              },
              "No"
            );
          }
          return offers;
        });
    },

    closeOverlay() {
      this.send("selectOffer", null);
    },

    selectOffer(offer) {
      this.getWithDefault("onSelect", _.noop)(offer);
      this.set("open", false);
    },

    setScannedSearchText(searchedText) {
      this.set("searchText", searchedText);
    }
  }
});
