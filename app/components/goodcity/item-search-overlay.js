import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Component.extend(SearchMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super(...arguments);
    this._super("item-search-overlay");
    this.set("uuid", _.uniqueId("item_search_overlay_"));
  },

  noInput: Ember.computed.not("searchText"),

  defaultChildPackagesList: function() {
    return this._getPackages(
      this,
      this.get("entity")
        .get("code")
        .get("defaultChildPackages")
    );
  },

  otherChildPackagesList: function() {
    return this._getPackages(
      this,
      this.get("entity")
        .get("code")
        .get("otherChildPackages")
    );
  },

  allChildPackagesList: function() {
    return this.defaultChildPackagesList().concat(
      this.otherChildPackagesList()
    );
  },

  _getPackages: function(model, packageNames) {
    var array = (packageNames || "").split(",");
    var packages = [];
    var allPackageTypes = this.get("store").peekAll("code");
    array.forEach(function(type) {
      allPackageTypes.filter(function(pkg) {
        return pkg.get("code") === type ? packages.push(pkg) : "";
      });
    });
    return packages;
  },

  actions: {
    cancel() {
      this.set("searchText", "");
      this.set("open", false);
    },

    selectItem(item) {
      this.set("open", false);
      this.get("onConfirm")(item);
    },

    async loadMoreItems(pageNo) {
      let associatedPacakgeIds = this.allChildPackagesList().getEach("id");
      let associatedPacakgeIdObj = {
        associatedPacakgeIds: associatedPacakgeIds
      };

      const params = this.trimQuery(
        _.merge(
          {},
          this.getSearchQuery(true),
          this.getPaginationQuery(pageNo),
          associatedPacakgeIdObj
        )
      );

      let items = await this.get("store").query("item", params);
      let filteredArray = [];
      items.forEach(item => {
        if (associatedPacakgeIds.indexOf(item.get("packageTypeId")) !== -1) {
          filteredArray.push(item);
        }
      });
      return items;
    }
  }
});
