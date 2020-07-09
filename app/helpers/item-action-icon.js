import Ember from "ember";
import { ITEM_ACTIONS } from "stock/constants/item-actions";
import _ from "lodash";

export default Ember.Helper.helper(function(state) {
  return ITEM_ACTIONS[_.findIndex(ITEM_ACTIONS, ["name", state[0]])].icon || "";
});
