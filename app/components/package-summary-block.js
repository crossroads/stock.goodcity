import Ember from "ember";
const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Component.extend({
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
  }),

  selectLocationAndUnpackItem(container, item, location_id, quantity) {
    if (!location_id) {
      return false;
    }
    if (item) {
      const params = {
        item_id: item.id,
        location_id: location_id,
        task: "unpack",
        quantity: quantity
      };
      this.get("packageService")
        .addRemoveItem(container.id, params)
        .then(data => {
          this.get("store").pushPayload(data);
        });
    }
  },

  actions: {
    async openLocationSearch(container, item, quantity) {
      let selectedLocation = await this.get(
        "locationService"
      ).userPickLocation();
      if (!selectedLocation) {
        return;
      }
      this.selectLocationAndUnpackItem(
        container,
        item,
        selectedLocation.id,
        quantity
      );
      // this.selectLocationAndUnpackItem(selectedLocation.id, quantity);
    }
  }
});
