import { sort } from "@ember/object/computed";
import { getOwner } from "@ember/application";
import detail from "./detail";
import AjaxPromise from "stock/utils/ajax-promise";

export default detail.extend({
  sortProperties: ["id"],
  sortedGcRequests: sort("model.goodcityRequests", "sortProperties")
});
