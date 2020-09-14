import Ember from "ember";
import _ from "lodash";

const MIN_DATE = moment()
  .subtract(2, "years")
  .toDate();
const DEFAULT_PICKADATE_CONFIG = {
  selectMonths: true,
  selectYears: true,
  format: "dd/mmm/yyyy",
  formatSubmit: "ddd mmm d",
  monthsFull: moment.months(),
  monthsShort: moment.monthsShort(),
  weekdaysShort: moment.weekdaysShort(),
  clear: false,
  today: false,
  close: false,
  min: moment().toDate()
};

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

  _cb() {
    const onSelect = this.get("onSelect");
    if (onSelect) {
      const date = this.get("selection");
      onSelect(date);
    }
  },

  onClose(pickadate) {
    Ember.$(document.activeElement).blur();
    if (this.setting) {
      return;
    }
    var date = pickadate.get("select") && pickadate.get("select").obj;

    if (date) {
      this.set("selection", date);
      this.setting = true;
      Ember.run.next(() => {
        this._cb();
        pickadate.set("select", moment(date).toDate(), {
          format: this.get("datePickerConfig.formatSubmit")
        });
        this.setting = false;
      });
    }
  },

  onStart(pickadate) {
    var date = this.get("selection");
    if (date) {
      pickadate.set("select", moment(new Date(date)).toDate(), {
        format: this.get("datePickerConfig.formatSubmit")
      });
    }
  },

  initializeConfig() {
    this.set("datePickerConfig", DEFAULT_PICKADATE_CONFIG);

    const enablePastDate = this.get("enablePastDate");
    if (enablePastDate) {
      this.set("datePickerConfig", {
        ...DEFAULT_PICKADATE_CONFIG,
        min: MIN_DATE
      });
    }

    const formatSubmit = this.get("formatSubmit");
    if (formatSubmit) {
      this.set("datePickerConfig", {
        ...DEFAULT_PICKADATE_CONFIG,
        format: formatSubmit
      });
    }
  },

  didInsertElement() {
    const component = this;
    this.initializeConfig();

    Ember.run.scheduleOnce("afterRender", this, function() {
      Ember.$(".pickadate").pickadate(
        _.extend({}, this.get("datePickerConfig"), {
          disable: component.get("disableWeekends") === true ? [1, 2] : [],
          onClose: function() {
            component.onClose(this);
          },
          onOpen: function() {
            component.onStart(this);
          },
          onStart: function() {
            component.onStart(this);
          }
        })
      );

      Ember.$(".picker__holder").click(function(e) {
        if (e.target !== this) {
          return;
        }
        Ember.$("[id$=selectedDate]").trigger("blur");
      });
    });
  }
});
