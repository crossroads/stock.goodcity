import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  rolePermissions: hasMany('rolePermission', { async: false }),

  permissions: Ember.computed('rolePermissions.[]', function(){
    return this.get('rolePermissions').map(rp => rp.get('permission'));
  }),

  permissionNames: Ember.computed('permissions.[]', function(){
    return this.get('permissions').map(p => p.get('name'));
  })
});
