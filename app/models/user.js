import attr from 'ember-data/attr';
import Ember from 'ember';
import { hasMany } from 'ember-data/relationships';
import Addressable from './addressable';

export default Addressable.extend({
  firstName:   attr('string'),
  lastName:    attr('string'),
  mobile:      attr('string'),
  createdAt:   attr('date'),
  email:       attr('string'),

  // permission:  belongsTo('permission', { async: false }),

  userRoles: hasMany('userRoles', { async: false }),
  roles: hasMany('roles', { async: false }),

  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  })
  // image:       belongsTo('image', { async: false }),
});
