import { next, scheduleOnce } from "@ember/runloop";
import $ from "jquery";
import TextField from "@ember/component/text-field";
import _ from "lodash";

const PICKADATE_CONFIG = {
  format: "ddd mmm d",
  monthsFull: moment.months(),
  monthsShort: moment.monthsShort(),
  weekdaysShort: moment.weekdaysShort(),
  clear: false,
  today: false,
  close: false,
  min: moment().toDate()
};

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
    "placeholder",
    "disableWeekends"
  ],

  _getValidDate: function(selectedDate) {
    var today = new Date();
    var currentDate = new Date();
    var selected = selectedDate;
    currentDate.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return currentDate > selected ? today : selectedDate;
  },

  isDateEqual: function(date) {
    var selected = this.get("selection");
    selected.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return selected.getTime() === date.getTime();
  },

  onClose(pickadate) {
    $(document.activeElement).blur();
    if (this.setting) {
      return;
    }
    var date = pickadate.get("select") && pickadate.get("select").obj;

    if (date) {
      this.set("selection", date);
      this.setting = true;
      next(() => {
        pickadate.set("select", new Date(date), { format: "ddd mmm d" });
        this.setting = false;
      });
    }
  },

  onStart(pickadate) {
    var date = this.get("selection");
    if (date) {
      date = this._getValidDate(date);
      pickadate.set("select", new Date(date), { format: "ddd mmm d" });
    }
  },

  didInsertElement() {
    const component = this;

    scheduleOnce("afterRender", this, function() {
      $(".pickadate").pickadate(
        _.extend({}, PICKADATE_CONFIG, {
          disable: component.get("disableWeekends") === true ? [1, 2] : [],
          onClose: function() {
            component.onClose(this);
          },
          onStart: function() {
            component.onStart(this);
          }
        })
      );
      $(".picker__holder").click(function(e) {
        if (e.target !== this) {
          return;
        }
        $("[id$=selectedDate]").trigger("blur");
      });
    });
  }
});
