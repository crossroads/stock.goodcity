import Ember from 'ember';

export default Ember.Component.extend({
  time: Ember.computed(function() {
    var timeValue = this.attrs.timeValue.value || new Date();
    return timeValue.toISOString();
  }),

  timeDisplay: Ember.computed(function() {
    var timeValue = this.attrs.timeValue.value || new Date();
    return moment(timeValue).fromNow(true);
  })
});