import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  isSubformAvailable(subformName) {
    return (
      ["computer", "electrical", "computer_accessory"].indexOf(subformName) >= 0
    );
  },

  isValueChanged(newValue, previousValue) {
    return newValue !== previousValue;
  },

  updateRequestAction(paramsObj) {
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
      .catch(xhr => {
        if (xhr.status === 422) {
          this.get("messageBox").alert(xhr.responseJSON.errors[0].message);
        } else {
          throw xhr;
        }
      })
      .finally(() => {
        loadingView.destroy();
      });
  },

  updateRequest(paramsObj, previousValue) {
    if (
      this.isValueChanged(
        paramsObj.packageDetailParams[paramsObj.snakeCaseKey],
        previousValue
      )
    ) {
      return this.updateRequestAction(paramsObj);
    }
  }
});
