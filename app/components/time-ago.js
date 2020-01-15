import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  time: computed(function() {
    var timeValue = this.attrs.timeValue.value || new Date();
    return timeValue.toISOString();
  }),

  timeDisplay: computed(function() {
    var timeValue = this.attrs.timeValue.value || new Date();
    return moment(timeValue).fromNow(true);
  })
});
