import { later } from "@ember/runloop";
import $ from "jquery";
import { observer } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  animateNotification: observer("currentController.model.[]", function() {
    var box = $(".contain-to-grid.notification");
    var notification = this.get("currentController").retrieveNotification();

    if (!notification) {
      box.hide();
      return;
    }
    if (box.is(":hidden")) {
      box.slideDown();
      $(".sticky_title_bar").animate(
        {
          top: "5%"
        },
        400
      );
      later(this, this.removeNotification, notification, 6000);
    }
  }).on("didInsertElement"),

  removeNotification: function(notification) {
    var controller = this.get("currentController");
    if (controller) {
      var remove = function() {
        controller.get("model").removeObject(notification);
      };
      var newNotification = controller.retrieveNotification(1);
      if (newNotification) {
        remove();
        later(this, this.removeNotification, newNotification, 6000);
      } else {
        $(".contain-to-grid.notification").slideUp(400, remove);
        $(".sticky_title_bar").animate(
          {
            top: "0"
          },
          400
        );
      }
    }
  }
});
