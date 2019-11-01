import Ember from "ember";
import AjaxPromise from "./../utils/ajax-promise";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Service.extend({
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
      return new AjaxPromise(
        paramsObj.url,
        "PUT",
        this.get("session.authToken"),
        {
          [paramsObj.detailType]: paramsObj.packageDetailParams
        }
      )
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
