import $ from "jquery";
import { inject as service } from "@ember/service";
import { later } from "@ember/runloop";
import Route from "@ember/routing/route";
import { getOwner } from "@ember/application";
import Ember from "ember";
import config from "../config/environment";
import preloadDataMixin from "../mixins/preload_data";
import AsyncMixin from "../mixins/async";
import _ from "lodash";

export default Route.extend(AsyncMixin, preloadDataMixin, {
  i18n: service(),
  isErrPopUpAlreadyShown: false,
  isItemUnavailable: false,
  isLoginPopUpAlreadyShown: false,
  logger: service(),
  messageBox: service(),
  cordova: service(),

  _loadDataStore: function() {
    return this.preloadData()
      .catch(error => {
        let isZeroStatus =
          error.status === 0 ||
          (error.errors && error.errors[0].status === "0");
        if (isZeroStatus) {
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
      let currentPath = window.location.href;
      let authToken = window.localStorage.getItem("authToken");
      let isLoginPath =
        currentPath.indexOf("login") >= 0 ||
        currentPath.indexOf("authenticate") >= 0;

      if (!authToken && !isLoginPath) {
        object.session.clear();
        object.store.unloadSessionData();
        object.transitionTo("login");
      } else if (authToken && isLoginPath) {
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
        return true;
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
      if (!this.loadingView) {
        this.loadingView = getOwner(this)
          .lookup("component:loading")
          .append();
      }
    },

    didTransition() {
      // Without later() it causes double render error
      // as we're trying to render a page and remove loading
      // indicator at a same time
      later(() => {
        if (this.loadingView) {
          this.loadingView.destroy();
          this.loadingView = null;
        }
      }, 100);
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
