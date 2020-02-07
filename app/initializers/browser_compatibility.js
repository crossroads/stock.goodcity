export default {
  name: "browser_compatibility",
  initialize: function() {
    if (!Promise.prototype.finally) {
      // Edge does not support promise.finally, which is used within many ember components
      // We add it when missing
      Promise.prototype.finally = function(fn) {
        this.then(fn);
      };
    }
  }
};
