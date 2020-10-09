import Ember from "ember";
import { ACTIONS_ICONS } from "stock/constants/action-icons";
import _ from "lodash";

export default Ember.Helper.helper(function(state) {
  let iconIndex = _.findIndex(ACTIONS_ICONS, ["name", state[0]]);

  if (iconIndex > -1) {
    return ACTIONS_ICONS[iconIndex].icon;
  } else {
    return "";
  }
});
