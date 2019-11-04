import Ember from "ember";
import _ from "lodash";

export default Ember.Mixin.create({
  currentRoute: Ember.computed.alias("router.currentRouteName"),

  routeObserver: Ember.observer("currentRoute", function() {
    const handler = this.getWithDefault("onNavigation", _.noop);
    handler.call(this, this.get("currentRoute"));
  })
});
