import Ember from 'ember';
import DS from 'ember-data';
import Addressable from './addressable';

var attr = DS.attr;

export default Addressable.extend({
  firstName:   attr('string'),
  lastName:    attr('string'),
  mobile:      attr('string'),

  userRoles: DS.hasMany('userRoles', { async: false }),

  roles: Ember.computed('userRoles.[]', function(){
    var roles = [];
    this.get('userRoles').forEach(userRole => {
      roles.push(userRole.get('role'));
    });
    return roles;
  }),

  roleNames: Ember.computed('roles', function(){
    if(this.get('roles.length')){
      return this.get('roles').getEach('name');
    }
  }),

  isReviewer: Ember.computed('roleNames', function(){
    if(this.get("roleNames") && this.get("roleNames").length) {
      return (this.get('roleNames').indexOf('Reviewer') >= 0);
    }
  }),

  isSupervisor: Ember.computed('roleNames', function(){
    if(this.get("roleNames") && this.get("roleNames").length) {
      return (this.get('roleNames').indexOf('Supervisor') >= 0);
    }
  }),

  canManageAppointments: Ember.computed('roles', function(){
    const roles = this.get('roles');
    return roles.find((r) => r.get('permissionNames').indexOf('can_manage_settings') >= 0);
  }),

  mobileWithCountryCode: Ember.computed('mobile', function(){
    return this.get('mobile') ? ("+852" + this.get('mobile')) : "";
  }),

  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  })
});
