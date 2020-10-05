import Ember from "ember";
import ItemActionMixin from "stock/mixins/item_actions";

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Component.extend(ItemActionMixin, {
  classNames: "",
  parentId: "epsilon",
  isRedirectable: true,
  disableLink: Ember.computed.not("isRedirectable"),
  locationService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),

  package: Ember.computed("model", function() {
    return this.get("store").peekRecord("item", this.get("pkg.id"));
  }),

  fetchAddedQuantity: Ember.computed("model", function() {
    let entityId = this.get("model.id");
    let pkgId = this.get("item.id");
    let promise = this.get("packageService").fetchAddedQuantity(
      entityId,
      pkgId
    );
    return ObjectPromiseProxy.create({
      promise
    });
  }),

  addedQuantityCount: Ember.computed
    .reads("fetchAddedQuantity.added_quantity")
    .readOnly(),

  compositeParentId: Ember.computed("parentId", function() {
    const parentId = this.get("parentId");
    return `parent-${parentId}`;
  }),

  favouriteImage: Ember.computed("model", function() {
    return this.get("model.favouriteImage.thumbImageUrl");
  })
});
