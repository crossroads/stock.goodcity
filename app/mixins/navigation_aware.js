import { observer } from "@ember/object";
import { alias } from "@ember/object/computed";
import Mixin from "@ember/object/mixin";
import _ from "lodash";

/**
 * Adds navigation awareness to component/services
 *
 * It provides:
 *    - A `currentRoute` property
 *    - Support for an `onNavigation` callback
 */
export default Mixin.create({
  currentRoute: alias("router.currentRouteName"),

  routeObserver: observer("currentRoute", function() {
    const handler = this.getWithDefault("onNavigation", _.noop);
    handler.call(this, this.get("currentRoute"));
  })
});
