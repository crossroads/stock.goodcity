import Ember from 'ember';
const { getOwner } = Ember;

export default Ember.Route.extend({

  i18n: Ember.inject.service(),

  beforeModel(transition = []) {
    try {
      localStorage.test = "isSafariPrivateBrowser";
    } catch (e) {
      this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
    }
    localStorage.removeItem('test');
    if (transition.queryParams.ln) {
      var language = transition.queryParams.ln === "zh-tw" ? "zh-tw" : "en";
      this.set('session.language', language);
    }

    Ember.onerror = window.onerror = error => {
      if(error.errors && error.errors[0] && error.errors[0].status === "401") {
        transition.abort();
      }
      this.handleError(error);
    };
  },

  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  handleError: function(reason) {
    try
    {
      var status;
      try { status = parseInt(reason.errors[0].status); }
      catch (err) { status = reason.status; }

      if(reason.name === "QuotaExceededError") {
        this.get("logger").error(reason);
        this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
      } else if (status === 401) {
        if (this.session.get('isLoggedIn')) {
          this.get('messageBox').alert(this.get("i18n").t('must_login'), () =>
            this.session.clear(),
            this.store.unloadAll(),
            this.transitionTo('login')
          );
        }
      } else {
        this.get("logger").error(reason);
        this.get("messageBox").alert(this.get("i18n").t("unexpected_error"));
      }

    } catch (err) {}
  },

  actions: {
    loading() {
      Ember.$(".loading-indicator").remove();
      var view = getOwner(this).lookup('component:loading').append();
      this.router.one('didTransition', view, 'destroy');
    },

    error(reason) {
      try {
        this.handleError(reason);
      } catch (err) {}
    },

    logMeOut() {
      this.session.clear();
      this.store.unloadAll();
      this.transitionTo('login');
    },
  }
});
