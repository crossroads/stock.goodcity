import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  dataUri: null,

  videoStream: "",
  useFrontCamera: true,

  constraints: {
    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440
      }
    }
  },

  async initializeCamera() {
    this.stopVideoStream();
    const cameraType = this.get("useFrontCamera") ? "user" : "environment";
    this.set("constraints.video.facingMode", cameraType);

    const vStream = await navigator.mediaDevices.getUserMedia(
      this.get("constraints")
    );
    this.set("videoStream", vStream);
    this.set("video.srcObject", this.get("videoStream"));
  },

  stopVideoStream() {
    const videoStream = this.get("videoStream");
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  },

  displayWebcam: Ember.computed.alias("packageService.openImageOverlay"),

  didRender() {
    if (this.get("packageService.openImageOverlay")) {
      let video = this.element.children[0];
      video.play();
      this.set("video", video);
      this.initializeCamera();
    }
  },

  actions: {
    snap() {
      const canvas = document.getElementById("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toDataURL("image/png");
      this.send("didSnap", canvas.toDataURL("image/png"));
    },

    changeCamera() {
      this.toggleProperty("useFrontCamera");
      this.initializeCamera();
    },

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
        this.stopVideoStream();
      });
    },

    closeOverlay() {
      this.stopVideoStream();
      this.set("packageService.openImageOverlay", false);
    }
  }
});
