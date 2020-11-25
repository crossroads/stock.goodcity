import Ember from "ember";

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),

  package: Ember.computed("pkg", function() {
    return this.get("store").peekRecord("item", this.get("pkg.id"));
  }),

  disableRemove: Ember.computed.alias("entity.isDispatched")
});
