import Ember from "ember";
import config from "stock/config/environment";

export default Ember.Component.extend({
  tagName: "a",
  href: "#",
  cordova: Ember.inject.service(),

  click() {
    if (config.cordova.enabled) {
      cordova.InAppBrowser.open(this.decodeLink(), "_system");
    } else {
      window.open(this.decodeLink(), "_system");
    }
    return false;
  },

  decodeLink: function() {
    var link = this.attrs.linkUrl.value || this.attrs.linkUrl;
    return link.replace(/&amp;/g, "&");
  }
});
