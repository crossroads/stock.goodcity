import Ember from "ember";

const NavigationService = Ember.Service.extend({
  router: Ember.inject.service(),

  transitions: {},

  createTransition(name, action) {
    this.transitions[name] = action;
  },

  runTransition(name, params, scope = this) {
    if (!this.transitions[name]) {
      throw `Transition ${name} does not exist`;
    }
    this.transitions[name].call(scope, this.get("router"), params);
  }
});

//
// Presets
//
NavigationService.createTransition("GO_BACK", function(router, params) {
  window.history.back();
});

export default NavigationService;
