import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default Component.extend({
  displayUserPrompt: false,
  store: service(),

  item: null,
  published: alias("item.allowWebPublish"),

  actions: {
    displayPublishOverlay() {
      this.set("displayUserPrompt", true);
    },

    setPublishStatus() {
      var item = this.get("item");
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var url = `/packages/${item.get("id")}`;

      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: { allow_web_publish: item.toggleProperty("allowWebPublish") }
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
