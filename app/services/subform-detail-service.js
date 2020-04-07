import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;
import ApiBaseService from "./api-base-service";
import { pluralize } from "ember-inflector";
import snakeCase from "lodash/snakeCase";

export default ApiBaseService.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  isSubformAvailable(subformName) {
    return (
      ["computer", "electrical", "computer_accessory", "medical"].indexOf(
        subformName
      ) >= 0
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
  },

  deleteDetailType(type, detailId) {
    const apiEndpoint = pluralize(snakeCase(type).toLowerCase());
    return this.DELETE(`/${apiEndpoint}/${detailId}`);
  }
});
