import Ember from 'ember';

export default Ember.TextArea.extend({
  tagName: "textarea",
  attributeBindings: ["disabled"],
  disabled: false,

  didDestroyElement: function (){
    Ember.$('body').css({'overflow-x':'hidden'});
  },

  didInsertElement: function(){
    Ember.$('body').css({'overflow-x':'unset'});
    // scrolling down to bottom of page
    window.scrollTo(0, document.body.scrollHeight);
  },

  valueChanged: Ember.observer('value', function () {
    var _this = this;
    var textarea = _this.element;

    if (textarea) {
      Ember.run.once(function () {
        // auto-resize height of textarea $('textarea')[0].
        if (textarea.scrollHeight < 120) {
          Ember.$(textarea)
            .css({
              'height': 'auto',
              'overflow-y': 'hidden'
            })
            .height(textarea.scrollHeight - 15);

            // scroll to bottom if message typed
            if (_this.get('value') !== "") {
              window.scrollTo(0, document.body.scrollHeight);
            }
        } else
        {
          Ember.$(textarea)
            .css({
              'height': 'auto',
              'overflow-y': 'auto'
            });
        }
      });
    }
  }),
});
