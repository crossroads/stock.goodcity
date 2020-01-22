import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select an order.
 *
 * The popup *does not* do anythinng to the order apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an order is selected
 */
export default Ember.Component.extend(SearchMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  packageService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super(...arguments);
    this._super("item-search-overlay");
    this.set("uuid", _.uniqueId("item_search_overlay_"));
  },

  noInput: Ember.computed.not("searchText"),

  actions: {
    cancel() {
      this.set("searchText", "");
      this.set("open", false);
    },

    selectItemWithQuanity(item) {
      if (item) {
        const params = {
          item_id: item.id,
          task: "pack"
        };
        this.get("packageService").addRemoveItem(this.get("entity.id"), params);
      }
      this.set("open", false);
      this.sendAction("onConfirm");
    },

    showMessagePopup(item) {
      this.get("messageBox").custom(
        `Add you sure you want to add this item to ${this.get(
          "entity.storageTypeName"
        )}?`,
        `Add to ${this.get("entity.storageTypeName")}`,
        () => this.send("selectItemWithQuanity", item),
        "Not Now"
      );
    },

    loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(true), this.getPaginationQuery(pageNo))
      );

      return this.get("store").query("item", params);
    }
  }
});
