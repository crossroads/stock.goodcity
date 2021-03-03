import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  dataUri: null,

  displayWebcam: Ember.computed("packageService.openImageOverlay", function() {
    return !!this.get("packageService.openImageOverlay");
  }),

  actions: {
    async didSnap(dataUri) {
      this.set("packageService.openImageOverlay", false);
      this.runTask(async () => {
        const signature = await new AjaxPromise(
          "/images/generate_signature",
          "GET",
          this.get("session.authToken"),
          {}
        );
        signature.file = dataUri;
        const image = await this.get("packageService").uploadToCloudinary(
          signature
        );
        this.get("getImageCallback")(image);
      });
    },

    closeOverlay() {
      this.set("packageService.openImageOverlay", false);
    },

    didError(error) {
      console.error(error);
    }
  }
});
