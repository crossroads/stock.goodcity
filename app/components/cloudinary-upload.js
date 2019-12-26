import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../config/environment";

export default Ember.Component.extend({
  tagName: "input",
  type: "file",
  accept: "image/*",
  name: "file",
  classNames: ["cloudinary-fileupload", "hidden_file_input"],
  "data-cloudinary-field": "image_upload",
  "data-url": config.APP.CLOUD_URL,
  attributeBindings: [
    "name",
    "type",
    "value",
    "data-cloudinary-field",
    "data-url",
    "data-form-data",
    "disabled",
    "style",
    "accept",
    "itemId"
  ],

  disabled: true,
  itemId: null,

  messageBox: Ember.inject.service(),
  intl: Ember.inject.service(),

  didInsertElement() {
    var _this = this;

    // https://github.com/blueimp/jQuery-File-Upload/wiki/Options
    var options = {
      dataType: "json",
      timeout: 120000, // 2 minute
      imageMaxHeight: 800,
      imageMaxWidth: 800,
      disableImageResize: false,

      fail: function(e, data) {
        if (data.errorThrown === "timeout") {
          _this
            .get("messageBox")
            .alert(_this.get("intl").t("upload-image.upload_error"));
        }
      }
    };

    // forward cloudinary events
    ["submit", "progress", "always", "fail", "done"].forEach(ev => {
      if (this[ev]) {
        options[ev] = (e, data) =>
          Ember.run(() => this.sendAction(ev, e, data));
      }
    });

    var reqData = this.get("itemId")
      ? { tags: `item_${this.get("itemId")}` }
      : {};
    new AjaxPromise(
      "/images/generate_signature",
      "GET",
      this.get("session.authToken"),
      reqData
    ).then(function(data) {
      if (!(_this.get("isDestroyed") || _this.get("isDestroying"))) {
        Ember.$(_this.element)
          .attr("data-form-data", JSON.stringify(data))
          .cloudinary_fileupload(options);
        _this.set("disabled", false);
        _this.sendAction("ready");
      }
    });
  }
});
