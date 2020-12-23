import Ember from "ember";
import Tribute from "npm:tributejs";

import AjaxPromise from "stock/utils/ajax-promise";

let users = null;
let selectedUsers = [];
const remoteSearch = (roles, order_id, authToken, cb) => {
  new AjaxPromise("/mentionable_users", "GET", authToken, {
    roles: roles.join(),
    order_id
  }).then(data => {
    const images = data.images;
    users = data.users.map(user => {
      return {
        name: `${user.first_name} ${user.last_name}`,
        id: user.id,
        image: images.find(img => img.id === user.image_id)
      };
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

  autoScroll: function() {
    window.scrollTo(0, document.body.scrollHeight);
  },

  didDestroyElement: function() {
    Ember.$("body").css({ "overflow-x": "hidden" });
    users = null;
  },

  valueObserver: function() {
    Ember.run.once(this, "processValue");
  }.observes("value"),

  processValue: function() {
    // scroll to bottom if message typed and restrict if blank message is sent
    if (!this.get("value")) {
      this.autoScroll();
      this.element.innerText = "";
    }
  },

  didInsertElement: async function() {
    Ember.$("body").css({ "overflow-x": "unset" });
    const _this = this;
    const roles = this.roles;
    const order_id = this.orderId;
    const tribute = new Tribute({
      values: function(text, cb) {
        if (!users) {
          return remoteSearch(
            roles,
            order_id,
            _this.get("session.authToken"),
            users => cb(users)
          );
        }
        return cb(users);
      },
      menuItemTemplate: item => {
        if (item.original.image) {
          let id = item.original.image.cloudinary_id;
          id = id.substring(id.indexOf("/") + 1);

          return `<div class='item'><img class='mentionedImage' src=${$.cloudinary.url(
            id
          )}></img> ${item.original.name}</div>`;
        } else {
          return `<div class='item'><img class='mentionedImage' src="assets/images/user.svg"></img> ${
            item.original.name
          }</div>`;
        }
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
        this.get("containerClass")
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

    // Adding event listeners for opening and closing of menu
    // https://github.com/zurb/tribute#events
    document
      .querySelector(".mentionable")
      .addEventListener("tribute-active-true", function(e) {
        _this.setMentionsActive(true);
      });

    document
      .querySelector(".mentionable")
      .addEventListener("tribute-active-false", function(e) {
        _this.setMentionsActive(false);
      });
  }
});
