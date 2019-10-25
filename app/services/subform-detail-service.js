import Ember from "ember";
import DS from "ember-data";
import AjaxPromise from "./../utils/ajax-promise";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  valueChanged(newValue, previousValue) {
    return newValue !== previousValue;
  },

  updateRequest(
    detailType,
    apiEndpoint,
    url,
    snakeCaseKey,
    packageDetailParams,
    previousValue
  ) {
    if (this.valueChanged(packageDetailParams[snakeCaseKey], previousValue)) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      return new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        [detailType]: packageDetailParams
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
