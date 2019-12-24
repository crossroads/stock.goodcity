import { once } from "@ember/runloop";
import { observer } from "@ember/object";
import $ from "jquery";
import TextArea from "@ember/component/text-area";

export default TextArea.extend({
  tagName: "textarea",
  attributeBindings: ["disabled"],
  classNames: "message-bar",
  disabled: false,

  didDestroyElement: function() {
    $("body").css({ "overflow-x": "hidden" });
  },

  autoScroll: function() {
    window.scrollTo(0, document.body.scrollHeight);
  },

  didInsertElement: function() {
    $("body").css({ "overflow-x": "unset" });
    // scrolling down to bottom of page
    this.autoScroll();
  },

  handleReturnAndAutoscroll: function() {
    var _this = this;
    var textarea = _this.element;
    $(textarea)
      .css({
        height: "auto",
        "overflow-y": "hidden"
      })
      .height(textarea.scrollHeight - 15);

    // scroll to bottom if message typed and restrict if blank message is sent
    if (_this.get("value") !== "") {
      $(".message-bar")
        .parent()
        .removeClass("has-error");
      _this.autoScroll();
    }
  },

  valueChanged: observer("value", function() {
    var _this = this;
    var textarea = _this.element;

    if (textarea) {
      once(function() {
        // auto-resize height of textarea $('textarea')[0].
        if (textarea.scrollHeight < 120) {
          _this.handleReturnAndAutoscroll();
        } else {
          $(textarea).css({ height: "auto", "overflow-y": "auto" });
        }
      });
    }
  })
});
