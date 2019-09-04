import Ember from "ember";
import config from "../config/environment";
import preloadDataMixin from "../mixins/preload_data";
const { getOwner } = Ember;

export default Ember.Route.extend(preloadDataMixin, {
  i18n: Ember.inject.service(),
  isErrPopUpAlreadyShown: false,
  isItemUnavailable: false,
  isLoginPopUpAlreadyShown: false,
  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  cordova: Ember.inject.service(),

  _loadDataStore: function() {
    return this.preloadData()
      .catch(error => {
        if (
          error.status === 0 ||
          (error.errors && error.errors[0].status === "0")
        ) {
          this.transitionTo("offline");
        } else {
          this.handleError(error);
        }
      })
      .finally(() => {
        // don't know why but placing this before preloadData on iPhone 6 causes register_device request to fail with status 0
        if (this.session.get("isLoggedIn")) {
          this.get("cordova").appLoad();
        }
      });
  },

  init() {
    var _this = this;
    var storageHandler = function(object) {
      var currentPath = window.location.href;
      var authToken = window.localStorage.getItem("authToken");
      if (
        !authToken &&
        !(
          currentPath.indexOf("login") >= 0 ||
          currentPath.indexOf("authenticate") >= 0
        )
      ) {
        object.session.clear();
        object.store.unloadSessionData();
        object.transitionTo("login");
      } else if (
        authToken &&
        (currentPath.indexOf("login") >= 0 ||
          currentPath.indexOf("authenticate") >= 0)
      ) {
        object.transitionTo("/");
      }
    };
    window.addEventListener(
      "storage",
      function() {
        storageHandler(_this);
      },
      false
    );
  },

  getErrorMessage(reason) {
    if (reason.errors.length && reason.errors[0].detail && reason.errors[0].detail.status == 422) {
      var message = reason.errors[0].detail.message;
    }
    return message ? message : this.get("i18n").t("unexpected_error");
  },

  showErrorPopup(reason) {
    this.get("logger").error(reason);
    if (!this.get("isErrPopUpAlreadyShown")) {
      this.set("isErrPopUpAlreadyShown", true);
      this.get("messageBox").alert(this.getErrorMessage(reason), () => {
        this.set("isErrPopUpAlreadyShown", false);
      });
    }
  },

  showItemIsNotAvailable() {
    this.set("isItemUnavailable", true);
    if (this.get("target") && this.get("target").currentPath !== "index") {
      this.get("messageBox").alert("This item is not available.", () => {
        this.set("isItemUnavailable", false);
        this.transitionTo("items.index");
      });
    }
  },

  redirectToLogin() {
    if (this.session.get("isLoggedIn")) {
      this.session.clear();
      this.session.unloadSessionData();
      this.transitionTo("login");
    }
  },

  beforeModel(transition = []) {
    try {
      localStorage.test = "isSafariPrivateBrowser";
    } catch (e) {
      this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
    }
    localStorage.removeItem("test");

    var language;
    if (transition.queryParams.ln) {
      language = transition.queryParams.ln === "zh-tw" ? "zh-tw" : "en";
    }

    language = this.session.get("language") || "en";
    this.set("session.language", language);
    moment.locale(language);
    this.set("i18n.locale", language);

    Ember.onerror = window.onerror = error => {
      if (error.errors && error.errors[0] && error.errors[0].status === "401") {
        transition.abort();
      }
      this.handleError(error);
    };
    return this._loadDataStore();
  },

  renderTemplate() {
    this.render(); // default template
    this.render("notifications", {
      // the template to render
      into: "application", // the template to render into
      outlet: "notifications", // the name of the outlet in that template
      controller: "notifications" // the controller to use for the template
    });
  },

  handleError: function(reason) {
    try {
      var status;
      // let hasPopup = Ember.$('.reveal-modal:visible').length > 0;
      try {
        status = parseInt(reason.errors[0].status, 10);
      } catch (err) {
        status = reason.status;
      }

      if (!window.navigator.onLine) {
        this.get("messageBox").alert(this.get("i18n").t("offline_error"));
        if (!reason.isAdapterError) {
          this.get("logger").error(reason);
        }
      } else if (reason.name === "QuotaExceededError") {
        this.get("logger").error(reason);
        this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
      } else if (reason.name === "NotFoundError" && reason.code === 8) {
        return false;
      } else if (status === 401) {
        this.redirectToLogin();
      } else {
        if (
          reason.message &&
          reason.message.indexOf("stockit_item") >= 0 &&
          reason.message.indexOf("404") >= 0 &&
          !this.get("isItemUnavailable")
        ) {
          this.showItemIsNotAvailable();
        } else {
          this.showErrorPopup(reason);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  actions: {
    loading() {
      if (config.environment !== "test") {
        Ember.$(".loading-indicator").remove();
        var view = getOwner(this)
          .lookup("component:loading")
          .append();
        this.router.one("didTransition", view, "destroy");
      }
    },

    error(reason) {
      try {
        this.handleError(reason);
      } catch (err) {
        console.log(err);
      }
    },

    logMeOut() {
      this.session.clear();
      this.session.unloadSessionData();
      this.transitionTo("login");
    }
  }
});
