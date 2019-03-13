import detail from "./detail";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default detail.extend({
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort(
    "model.goodcityRequests",
    "sortProperties"
  )
});
