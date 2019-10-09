import Ember from "ember";
import ApiBaseService from "./api-base-service";

function ID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}

/**
 * Designation Service
 *
 * @description Control of designation of packages to orders
 * <br> Notes:
 * <br> * Stock currently use the 'designation' model, which in reality is
 * <br> the 'order' model. We're trying to move away from this model name.
 * <br>
 * <br> * 'Designation' here refers to the assignment of a package to an order
 * <br> which mostly involves operations on the orders_package join table
 *
 */
export default ApiBaseService.extend({
  store: Ember.inject.service(),

  /**
   * Runs a remote action on the specified orders_package
   *
   * @param {String|Model} ordersPackage
   * @param {Stirng} actionName
   * @param {Object} [params={}]
   * @returns {Promise<Model>}
   */
  async execAction(ordersPackage, actionName, params = {}) {
    const id = ID(ordersPackage);
    const url = `/orders_packages/${id}/actions/${actionName}`;

    const data = await this.PUT(url, params);

    this.get("store").pushPayload(data);
    return this.get("store").peekRecord("orders_package", id);
  },

  /**
   * Cancels an orders_package
   * Shorthand for execAction(..., 'cancel')
   *
   * @param {String|Model} ordersPackage
   * @returns {Promise<Model>}
   */
  cancel(ordersPackage) {
    return this.execAction(ordersPackage, "cancel");
  },

  /**
   * Dispatches an orders_package
   * Shorthand for execAction(..., 'dispatch')
   *
   * @param {String|Model} ordersPackage
   * @returns {Promise<Model>}
   */
  dispatch(ordersPackage) {
    return this.execAction(ordersPackage, "dispatch");
  },

  /**
   * Undispatches an orders_package
   * Shorthand for execAction(..., 'undispatch')
   *
   * @param {String|Model} ordersPackage
   * @returns {Promise<Model>}
   */
  undispatch(ordersPackage) {
    return this.execAction(ordersPackage, "undispatch");
  },

  /**
   * Redesignates the orders_package to a different order
   * Shorthand for execAction(..., 'redesignate')
   *
   * @param {String|Model} ordersPackage The orders_package to update (or its ID)
   * @param {String|Model} newOrder The new order to designate to (or its ID)
   * @returns {Promise<Model>}
   */
  redesignate(ordersPackage, newOrder) {
    return this.execAction(ordersPackage, "redesignate", {
      order_id: ID(newOrder)
    });
  },

  /**
   * Modifies the quantity of packages needed for the order
   * Shorthand for execAction(..., 'edit_quantity')
   *
   * @param {String|Model} ordersPackage The orders_package to update (or its ID)
   * @param {Number} quantity The new quantity
   * @returns {Promise<Model>}
   */
  editQuantity(ordersPackage, quantity) {
    return this.execAction(ordersPackage, "undispatch", { quantity });
  }
});
