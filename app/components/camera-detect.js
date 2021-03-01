import Ember from "ember";

export default Ember.Component.extend({
  didInsertElement() {
    let videoArea = document.querySelector("video");
    let videoSelect = document.querySelector("#camera");
    let takeProfilePicture = document.querySelector("#takeProfilePicture");
    let profilePicCanvas = document.querySelector("#profilePicCanvas");
    let profilePicOutput = document.querySelector("#profilePicOutput");
    let videoTag = document.querySelector("#videoTag");
    const width = 240;
    let height = 0;
    let streaming = false;
    takeProfilePicture.addEventListener(
      "click",
      function(env) {
        takeProfilePic();
        env.preventDefault();
      },
      false
    );
    videoTag.addEventListener(
      "canplay",
      function(ev) {
        if (!streaming) {
          height = videoTag.videoHeight / (videoTag.videoWidth / width);
          if (isNaN(height)) {
            height = width / (4 / 3);
          }
          videoTag.setAttribute("width", width);
          videoTag.setAttribute("height", height);
          profilePicCanvas.setAttribute("width", width);
          profilePicCanvas.setAttribute("height", height);
          stream = true;
        }
      },
      false
    );
    function takeProfilePic() {
      let context = profilePicCanvas.getContext("2d");
      if (width && height) {
        profilePicCanvas.width = width;
        profilePicCanvas.height = height;
        context.drawImage(videoTag, 0, 0, width, height);
        var data = profilePicCanvas.toDataURL("image/png");
        profilePicOutput.setAttribute("src", data);
      }
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then(gotDevices)
      .then(startStream);
    function gotDevices(foundDevices) {
      for (var i = 0; i !== foundDevices.length; ++i) {
        var deviceInfo = foundDevices[i];
        var option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "videoinput") {
          option.text =
            deviceInfo.label || "camera " + (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } else {
          console.log("Found one other kind of source/device: ", deviceInfo);
        }
      }
    }
    function startStream() {
      navigator.getUserMedia = navigator.getUserMedia;
      let videoSource = videoSelect.value;
      let constraints = {
        audio: false,
        video: {
          optional: [
            {
              sourceId: videoSource
            }
          ]
        }
      };
      navigator.getUserMedia(constraints, onSuccess, onError);
    }
    function onSuccess(stream) {
      videoArea.srcObject = stream;
      videoArea.className = "grayscale_filter";
      videoArea.play();
    }
    function onError(error) {
      console.log("error");
    }
  }
});
