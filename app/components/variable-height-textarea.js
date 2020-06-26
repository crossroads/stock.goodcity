import Ember from "ember";
import Tribute from "npm:tributejs";

import AjaxPromise from "stock/utils/ajax-promise";

let users = null;
let selectedUsers = [];
const remoteSearch = (authToken, cb) => {
  new AjaxPromise("/mentionable_users", "GET", authToken, {
    roles: "Order administrator, Order fulfilment"
  }).then(data => {
    users = data.users.map(user => {
      return { name: user.first_name + " " + user.last_name, id: user.id };
    });
    return cb(users);
  });
};

export default Ember.Component.extend({
  tagName: "p",
  contentEditable: true,
  attributeBindings: ["disabled", "value", "setBody"],
  classNames: "message-bar mentionable",
  disabled: false,
  users: [],
  initializeMentionableUsers: async () => {
    let res = await new AjaxPromise(
      "/mentionable_users",
      "GET",
      this.get("session.authToken"),
      {
        roles: "Order administrator, Order fulfilment"
      }
    );

    this.set(
      "users",
      res.users.map(user => {
        return { name: user.first_name + " " + user.last_name, id: user.id };
      })
    );
  },

  didDestroyElement: function() {
    Ember.$("body").css({ "overflow-x": "hidden" });
  },

  valueObserver: function() {
    Ember.run.once(this, "processValue");
  }.observes("value"),

  processValue: function() {
    if (!this.value) {
      this.element.innerText = "";
      window.scrollTo(0, document.body.scrollHeight);
    }
  },

  didInsertElement: async function() {
    Ember.$("body").css({ "overflow-x": "unset" });

    const _this = this;
    const tribute = new Tribute({
      values: function(text, cb) {
        if (!users) {
          return remoteSearch(_this.get("session.authToken"), users =>
            cb(users)
          );
        }
        return cb(users);
      },
      menuItemTemplate: item => {
        return `<div class='item'><img class='mentionedImage' src="assets/images/user.svg"></img> ${
          item.original.name
        }</div>`;
      },
      selectTemplate: function(item) {
        if (typeof item === "undefined") return null;

        selectedUsers.push(item.original);
        return `<span class='mentioned' contenteditable="false">@${
          item.original.name
        }</span>`;
      },
      selectClass: "highlight",
      lookup: "name",
      fillAttr: "name",
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
          new RegExp(`@${user.name}`, "g"),
          `[:${user.id}]`
        );
      });

      _this.setMessageContext({
        parsedText,
        displayText: this.innerText
      });
    });
  }
});
