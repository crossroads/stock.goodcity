import Ember from "ember";
import _ from "lodash";

function isValidDate(d) {
  return d && d instanceof Date && !isNaN(d);
}

export default Ember.TextField.extend({
  tagName: "input",
  classNames: "pickadate",
  attributeBindings: [
    "name",
    "type",
    "value",
    "id",
    "required",
    "pattern",
    "placeholder",
    "minDate",
    "maxDate"
  ],

  model: Ember.computed({
    get() {
      return this.get("_model");
    },
    set(k, val) {
      if (!isValidDate(val)) {
        val = null;
      }
      this.set("_model", val);
      this.set("value", val ? moment(val).format("ddd MMM D") : "");
      return val;
    }
  }),

  didInsertElement() {
    const cmp = this;

    Ember.run.scheduleOnce("afterRender", this, function() {
      Ember.$(this.element).pickadate({
        format: "ddd mmm d",
        monthsFull: moment.months(),
        monthsShort: moment.monthsShort(),
        weekdaysShort: moment.weekdaysShort(),
        clear: false,
        today: false,
        close: false,

        onClose: function() {
          Ember.$(document.activeElement).blur();
        },

        onOpen: function() {
          const date = cmp.get("model");
          this.set("val", date ? date : null);
          const [minDate, maxDate] = [cmp.get("minDate"), cmp.get("maxDate")];
          this.set("min", minDate || "");
          this.set("max", maxDate || "");
        },

        onSet: function() {
          // Support for callback
          var onSelect = cmp.get("onSelect");
          const date =
            this.get("val") || (this.get("select") && this.get("select").obj);
          if (isValidDate(date) && _.isFunction(onSelect)) {
            onSelect(date);
          }
        }
      });
    });
  }
});
