import Ember from "ember";

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),

  package: Ember.computed("pkg", function() {
    return this.get("store").peekRecord("item", this.get("pkg.id"));
  }),

  addedQuantity: Ember.computed("pkg", function() {
    let pkgId = this.get("pkg.id");
    let entityId = this.get("entity.id");
    let promise = this.get("packageService").fetchAddedQuantity(
      entityId,
      pkgId
    );
    return ObjectPromiseProxy.create({
      promise
    });
  }),

  addedQuantityCount: Ember.computed
    .reads("addedQuantity.added_quantity")
    .readOnly(),

  actions: {
    openLocationSearch(pkg) {
      this.get("onConfirm")(pkg, this.get("addedQuantityCount"));
    }
  }
});
