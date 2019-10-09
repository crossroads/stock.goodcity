/**
 * Experimental :
 *    Given that a lot of UI selection overlays (e.g search_orders, search_organisation)
 *    are built as separate pages (arguable imo), there's no easy way to "return" some data
 *
 *    It gets very messy to create async flows that require data from multiple places.
 *
 *    So here's a little experiment on a potential approach:
 *
 *    - We create a deferred promise, which is assigned an ID
 *    - We transition to a page (e.g search_orders) and we pass it this ID
 *    - The page does it's thing, and resolves the deferred promise
 *    - the flow continues on the other side
 *
 *
 * e.g
 *    // Search orders page
 *
 *    onOrderSelected(order) {
 *      DeferredService.resolve(this.params.deferId, order);
 *    }
 *
 *    // Some other page
 *
 *    const order = await DeferredService.deferredTransition(
 *       'search_orders'
 *    )
 *    doSomething(order)
 *
 *
 */

import Ember from "ember";

export default Ember.Service.extend({
  init() {
    this.nextId = 1;
    this.cache = {};
  },

  defer() {
    const deferred = Ember.RSVP.defer();
    const deferId = this.nextId++;

    this.cache[deferId] = deferred;

    return [deferId, deferred.promise];
  },

  deferredTransition(route, routeParams) {
    const [deferId, promise] = this.defer();
    this.transitionTo(route, { ...routeParams, deferId });
    return promise;
  },

  resolve(deferId, result) {
    _.pop(deferId).resolve(result);
  },

  reject(deferId, error) {
    _.pop(deferId).reject(error);
  },

  _pop(deferId) {
    const deferred = this.cache[deferId];
    delete this.cache[deferId];
    return deferred;
  }
});
