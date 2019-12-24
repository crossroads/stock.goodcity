import $ from "jquery";
import { scheduleOnce } from "@ember/runloop";
import { computed } from "@ember/object";
import TextField from "@ember/component/text-field";
import _ from "lodash";

function isValidDate(d) {
  return d && d instanceof Date && !isNaN(d);
}

export default TextField.extend({
  tagName: "input",
  classNames: "pickadate",
  attributeBindings: [
    "name",
    "type",
    "value",
    "id",
    "required",
    "pattern",
    "placeholder"
  ],

  model: computed({
    get(k) {
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

    scheduleOnce("afterRender", this, function() {
      $(this.element).pickadate({
        format: "ddd mmm d",
        monthsFull: moment.months(),
        monthsShort: moment.monthsShort(),
        weekdaysShort: moment.weekdaysShort(),
        clear: false,
        today: false,
        close: false,

        onClose: function() {
          const picker = this;
          $(document.activeElement).blur();

          const date = picker.get("select") && picker.get("select").obj;

          // Support for model binding
          cmp.set("model", date);
          cmp.notifyPropertyChange("model");

          // Support for callback
          var onSelect = cmp.get("onSelect");
          if (_.isFunction(onSelect)) {
            onSelect(date);
          }
        }
      });
    });
  }
});
