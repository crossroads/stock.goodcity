import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({

  name:             attr('string'),
  code:             attr('string'),
  visibleInSelects: attr('boolean', { defaultValue: false }),
  location:         belongsTo('location', { async: false }),

  defaultChildPackages: attr('string'),
  otherChildPackages:   attr('string'),

  defaultChildPackagesList: function() {
    return this._getPackages(this, this.get("defaultChildPackages"));
  },

  otherChildPackagesList: function() {
    return this._getPackages(this, this.get("otherChildPackages"));
  },

  allChildPackagesList: function() {
    return this.defaultChildPackagesList().concat(this.otherChildPackagesList());
  },

  _getPackages: function(model, packageNames){
    var array = (packageNames || "").split(',');
    var packages = [];
    var allPackageTypes = model.store.peekAll("code");
    array.forEach(function(type) {
      allPackageTypes.filter(function (pkg) {
        return pkg.get("code") === type ? packages.push(pkg) : "";
      });
    });
    return packages;
  }
});
