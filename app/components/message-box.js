import Ember from "ember";
import messageBox from "stock/templates/components/message-box";

export default Ember.Component.extend({
  layout: messageBox,
  message: "",
  btn1Text: "",
  btn1Callback: () => {},
  btn2Text: "",
  btn2Callback: () => {},
  displayCloseLink: false,
  isVisible: false,

  init() {
    this._super(...arguments);
    this.get("router").addObserver("currentRouteName", () => this.close());
  },

  close() {
    if (this.get("isVisible")) {
      this.set("isVisible", false);
    } else {
      this.destroy();
    }
  },

  actions: {
    btn1Click() {
      if (this.btn1Callback) {
        if (this.btn1Callback() === false) {
          return;
        }
      }
      this.close();
    },

    btn2Click() {
      if (this.btn2Callback) {
        if (this.btn2Callback() === false) {
          return;
        }
      }
      this.close();
    },

    closeModal() {
      this.close();
    },

    //Fix: Too deeply nested component(3 levels) failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
