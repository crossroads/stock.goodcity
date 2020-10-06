import Ember from "ember";
import _ from "lodash";

//
// Small link component which holds all the designation actions
//
// Usage:
//
// {{#goodcity/designate-link order=orderToDesignateTo pkg=packageToDesignate}}
//    <div> Click me to designate {{pkg.inventory_number}} to {{orderToDesignateTo.code}}
// {{/goodcity/designate-link}}
//
export default Ember.Component.extend({
  designationService: Ember.inject.service(),

  actions: {
    beginDesignation() {
      this.get("designationService").beginDesignation({
        pkg: this.get("pkg"),
        order: this.get("order"),
        allowItemChange: this.get("allowItemChange"),
        allowOrderChange: this.get("allowOrderChange")
      });
    }
  }
});
