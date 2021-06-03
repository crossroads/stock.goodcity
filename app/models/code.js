import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  code: attr("string"),
  otherTerms: attr("string"),
  allowPieces: attr("boolean", { defaultValue: false }),
  allowBox: attr("boolean"),
  allowPallet: attr("boolean"),
  allowPackage: attr("boolean"),
  descriptionEn: attr("string"),
  descriptionZhTw: attr("string"),
  visibleInSelects: attr("boolean", { defaultValue: false }),
  allowExpiryDate: attr("boolean", { defaultValue: false }),
  location: belongsTo("location", { async: false }),
  goodcityRequests: hasMany("goodcity_request", { async: false }),

  defaultChildPackages: attr("string"),
  subform: attr("string"),
  otherChildPackages: attr("string"),

  defaultChildPackagesList: function() {
    return this._getPackages(this, this.get("defaultChildPackages"));
  },

  otherChildPackagesList: function() {
    return this._getPackages(this, this.get("otherChildPackages"));
  },

  allChildPackagesList: function() {
    return this.defaultChildPackagesList().concat(
      this.otherChildPackagesList()
    );
  },

  _getPackages: function(model, packageNames) {
    var array = (packageNames || "").split(",");
    var allPackageTypes = model.store.peekAll("code");
    return allPackageTypes.filter(pkg => array.indexOf(pkg.get("code")) > -1);
  }
});
