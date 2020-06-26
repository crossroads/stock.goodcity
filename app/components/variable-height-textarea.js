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
    users.sort((u1, u2) =>
      u1.name.toLowerCase().localeCompare(u2.name.toLowerCase())
    );
    return cb(users);
  });
};

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

    // Handle copy and paste operation for contenteditable
    $(document).on("copy", "[contenteditable]", function(e) {
      e = e.originalEvent;
      var selectedText = window.getSelection();
      var range = selectedText.getRangeAt(0);
      var selectedTextReplacement = range.toString();
      e.clipboardData.setData("text/plain", selectedTextReplacement);
      e.preventDefault();
    });

    $(document).on("paste", "[contenteditable]", function(e) {
      e.preventDefault();

      if (window.clipboardData) {
        var content = window.clipboardData.getData("Text");
        if (window.getSelection) {
          var selObj = window.getSelection();
          var selRange = selObj.getRangeAt(0);
          selRange.deleteContents();
          selRange.insertNode(document.createTextNode(content));
        }
      } else if (e.originalEvent.clipboardData) {
        content = (e.originalEvent || e).clipboardData.getData("text/plain");
        document.execCommand("insertText", false, content);
      }
    });
  }
});
