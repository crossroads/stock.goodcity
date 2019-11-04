import Ember from "ember";
import _ from "lodash";

/**
 * Adds navigation awareness to component/services
 *
 * It provides:
 *    - A `currentRoute` property
 *    - Support for an `onNavigation` callback
 */
export default Ember.Mixin.create({
  currentRoute: Ember.computed.alias("router.currentRouteName"),

  routeObserver: Ember.observer("currentRoute", function() {
    const handler = this.getWithDefault("onNavigation", _.noop);
    handler.call(this, this.get("currentRoute"));
  })
});
