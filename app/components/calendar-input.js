import Ember from 'ember';

export default Ember.TextField.extend({
  tagName: 'input',
  classNames: 'pickadate',
  attributeBindings: [ "name", "type", "value", "id", 'required', 'pattern', 'placeholder', 'disableWeekends' ],

  _getValidDate: function(selectedDate){
    var today = new Date();
    var currentDate = new Date();
    var selected = selectedDate;
    currentDate.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    return currentDate > selected ? today : selectedDate;
  },

  isDateEqual: function(date) {
    var selected = this.get('selection');
    selected.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return selected.getTime() === date.getTime();
  },

  didInsertElement() {
    var _this = this;
    var setting = false;

    Ember.run.scheduleOnce('afterRender', this, function(){
      Ember.$('.pickadate').pickadate({
        format: 'ddd mmm d',
        monthsFull: moment.months(),
        monthsShort: moment.monthsShort(),
        weekdaysShort: moment.weekdaysShort(),
        disable: _this.get('disableWeekends') === true ? [1,2] : [],
        clear: false,
        today: false,
        close: false,
        min: moment().toDate(),

        onClose: function() {
          Ember.$(document.activeElement).blur();
          if (setting) { return; }
          var date = this.get('select') && this.get('select').obj;

          if(date) {
            _this.set("selection", date);
            setting = true;
            Ember.run.next(() => {
              this.set('select', new Date(date), { format: 'ddd mmm d' });
              setting = false;
            });
          }
        },

        onStart: function(){
          var date = _this.get('selection');
          if(date) {
            date = _this._getValidDate(date);
            this.set('select', new Date(date), { format: 'ddd mmm d' });
          }
        }
      });

      closeOnClick();
    });

    function closeOnClick(){
      Ember.$(".picker__holder").click(function(e){
        if(e.target !== this) { return; }
        Ember.$("[id$=selectedDate]").trigger("blur");
      });
    }
  }
});
