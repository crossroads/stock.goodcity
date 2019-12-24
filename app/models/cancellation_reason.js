import DS from "ember-data";
// import Ember from 'ember';

var attr = DS.attr;

export default DS.Model.extend({
  name: attr("string")
});
