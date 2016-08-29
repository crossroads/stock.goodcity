import Ember from 'ember';

export default Ember.TextArea.extend({
  tagName: "textarea",

  attributeBindings: ["data-autoresize", "value", "name", "id", "placeholder", "maxlength", "required", "pattern"],

  valueChanged: Ember.observer('value', function () {
    this.setTextareaHeight();
  }),

  didInsertElement() {
    this.setTextareaHeight();
  },

  setTextareaHeight: function(){
    var textarea = this.element;
    var offset = textarea.offsetHeight - textarea.clientHeight;

    if(this.get("value").length === 0) {
      Ember.$(textarea).css('height', 'auto');
    } else if (textarea.scrollHeight < 120) {
      Ember.$(textarea)
        .css('height', 'auto')
        .css('height', textarea.scrollHeight + offset)
        .removeAttr('data-autoresize');
    } else {
      Ember.$(textarea)
        .css({'height':'auto','overflow-y':'auto'})
        .height(105);
    }
  }
});
