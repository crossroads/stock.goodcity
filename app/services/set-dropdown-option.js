import Service, { inject as service } from "@ember/service";
import _ from "lodash";

export default Service.extend({
  session: service(),
  store: service(),

  setOptions(column, package_details) {
    if (["frequency", "voltage", "testStatus"].indexOf(column) > -1) {
      return this.fetchLookups(`electrical_${_.snakeCase(column)}`);
    } else if (column === "compTestStatus") {
      return this.fetchLookups("comp_test_status");
    } else {
      let dataObj = [];
      package_details.map(function(data) {
        if (data.get(column)) {
          dataObj.push({
            id: data.id,
            tag: data.get(column)
          });
        }
      });
      return dataObj;
    }
  },

  fetchLookups(lookupName) {
    let lookupArray = [];
    let lookupData = this.get("store")
      .peekAll("lookup")
      .filterBy("name", lookupName);
    lookupData.map(lookup => {
      let idAndLabel = lookup.getProperties("id", "labelEn");
      lookupArray.push({
        id: idAndLabel.id,
        tag: idAndLabel.labelEn
      });
    });
    return lookupArray;
  }
});
