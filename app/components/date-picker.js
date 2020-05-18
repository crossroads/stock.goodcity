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
        onStart: function() {
          if (this.get("value")) {
            cmp.set("_model", this.get("value"));
            cmp.set("value", moment(this.get("value")).format("ddd MMM D"));
          }
        },

        onClose: function() {
          Ember.$(document.activeElement).blur();
          var onSelect = cmp.get("onSelect");
          if (onSelect) {
            const date =
              this.get("val") || (this.get("select") && this.get("select").obj);
            if (isValidDate(date) && _.isFunction(onSelect)) {
              onSelect(date);
              cmp.set("value", moment(date).format("ddd MMM D"));
            }
          }
        },

        onOpen: function() {
          const date = cmp.get("model");
          this.set("val", date ? date : null);
          const [minDate, maxDate] = [cmp.get("minDate"), cmp.get("maxDate")];
          this.set("min", minDate || "");
          this.set("max", maxDate || "");
        }
      });
    });
  }
});
