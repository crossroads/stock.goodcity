import { helper as buildHelper } from "@ember/component/helper";

/**
 * Returns the icon based on the ordersPackage's state
 *
 * Example usage:
 *
 * {{fa-icon (orders-package-icon record.state)}
 *
 * @param {String} state the orders package state
 * @returns {String}
 */
export default buildHelper(function([state]) {
  return {
    cancelled: "ban",
    designated: "shopping-basket",
    dispatched: "paper-plane"
  }[state];
});
