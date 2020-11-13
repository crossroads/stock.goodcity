import Ember from "ember";
import _ from "lodash";

import conversation from "./conversation";
import { ROLES } from "stock/constants/roles";

export default conversation.extend({
  isPrivate: true,
  roles: Ember.computed(function() {
    return _.values(ROLES["STOCK_APP_ROLES"]);
  })
});
