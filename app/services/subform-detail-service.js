import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  isValueChanged(newValue, previousValue) {
    return newValue !== previousValue;
  },

  updateRequest(paramsObj, previousValue) {
    if (
      this.isValueChanged(
        paramsObj.packageDetailParams[paramsObj.snakeCaseKey],
        previousValue
      )
    ) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      return this.PUT(paramsObj.url, {
        [paramsObj.detailType]: paramsObj.packageDetailParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
          return data;
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
