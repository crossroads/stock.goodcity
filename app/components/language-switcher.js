import Ember from 'ember';

export default Ember.Component.extend({

  isEnglish: Ember.computed('session.language', function() {
    return JSON.parse(window.localStorage.getItem("language")) === 'en';
  }),

  isChinese: Ember.computed('session.language', function() {
    return JSON.parse(window.localStorage.getItem("language")) === 'zh-tw';
  }),

  actions: {
    setLanguage(language) {
      this.set('session.language', language);
      window.location.reload();
    }
  }

});
