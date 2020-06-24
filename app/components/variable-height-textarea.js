import Ember from "ember";
import Tribute from "npm:tributejs";

import AjaxPromise from "stock/utils/ajax-promise";

let users = null;
let selectedUsers = [];
const remoteSearch = cb => {
  const token = JSON.parse(window.localStorage.authToken);
  new AjaxPromise("/mentionable_users", "GET", token, {
    roles: "Order administrator, Order fulfilment"
  }).then(data => {
    users = data.users;
    return cb(users);
  });
};

const fullName = item =>
  `${item.first_name} ${item.last_name ? item.last_name : ""}`;

export default Ember.Component.extend({
  tagName: "p",
  contentEditable: true,
  attributeBindings: ["disabled", "value", "setBody"],
  classNames: "message-bar mentionable",
  disabled: false,

  didDestroyElement: function() {
    Ember.$("body").css({ "overflow-x": "hidden" });
  },

  valueObserver: function() {
    Ember.run.once(this, "processValue");
  }.observes("value"),

  processValue: function() {
    if (!this.value) {
      this.element.innerText = "";
    }
  },

  didInsertElement: function() {
    Ember.$("body").css({ "overflow-x": "unset" });

    const _this = this;
    const tribute = new Tribute({
      values: function(text, cb) {
        if (!users) {
          return remoteSearch(users => cb(users));
        }
        return cb(users);
      },
      menuItemTemplate: item => {
        return `<div class='item'><img class='mentionedImage' src="assets/images/user.svg"></img> ${fullName(
          item.original
        )}</div>`;
      },
      selectTemplate: function(item) {
        if (typeof item === "undefined") return null;

        selectedUsers.push(item.original);
        return `<span class='mentioned' contenteditable="false">@${fullName(
          item.original
        )}</span>`;
      },
      selectClass: "highlight",
      noMatchTemplate: () => null,
      menuContainer: document.getElementsByClassName(
        "message-textbar-container"
      )[0]
    });

    tribute.attach(Ember.$(this.element));

    this.element.addEventListener("input", function() {
      let parsedText = this.innerText;
      selectedUsers.forEach(user => {
        parsedText = parsedText.replace(
          new RegExp(`@${fullName(user)}`, "g"),
          `[:${user.id}]`
        );
      });

      _this.setMessageContext({
        parsedText,
        displayText: this.innerText
      });
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
});
