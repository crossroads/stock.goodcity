import Service from "@ember/service";

export default Service.extend({
  arrayExists: function(arr) {
    return arr && arr.length;
  },

  exists: function(obj) {
    return obj;
  },

  stringifyArray(arr) {
    return Array.isArray(arr) ? arr.toString() : "";
  }
});
