import Ember from "ember";
import _ from "lodash";
import DesignationActions from "stock/mixins/designation_actions";

//
// Small link component which holds all the designation actions
//
// Usage:
//
// {{#goodcity/designate-link order=orderToDesignateTo pkg=packageToDesignate}}
//    <div> Click me to designate {{pkg.inventory_number}} to {{orderToDesignateTo.code}}
// {{/goodcity/designate-link}}
//
export default Ember.Component.extend(DesignationActions, {});
