import Ember from "ember";
import _ from "lodash";

function buildOverlay(parent = document.body, style = {}) {
  const container = Ember.$(parent);
  const overlay = Ember.$("<div></di>");

  overlay.css({
    width: "100%",
    height: "100%",
    position: parent === document.body ? "fixed" : "absolute",
    "z-index": "2000",
    top: "0px",
    left: "0px",
    "background-color": "black",
    ...style
  });

  container.prepend(overlay);

  return overlay;
}

function addStopButton(parent, callback) {
  const button = Ember.$("<div></di>");

  button.text("STOP");
  button.css({
    width: "70px",
    height: "30px",
    "background-color": "white",
    color: "black",
    padding: "5px",
    "border-radius": "50px",
    "z-index": "1000",
    position: "relative",
    margin: "20px auto",
    "line-height": "20px",
    "text-align": "center"
  });

  parent.append(button);
  button.one("click", callback);

  return button;
}

export function buildCameraView(parent = null, opts = {}) {
  const overlay = buildOverlay(parent || document.body);
  const cameraView = Ember.$("<div></di>");

  cameraView.css("position", "relative");

  if (parent) {
    cameraView.css({
      width: "100%",
      height: "100%",
      position: "absolute",
      top: "0px",
      left: "0px"
    });
  } else {
    cameraView.css({
      width: "90vw",
      "max-width": "600px",
      height: "90vw",
      "max-height": "600px",
      margin: "0 auto",
      "margin-top": "20vh"
    });
  }

  overlay.prepend(cameraView);

  return {
    element: cameraView.get(0),

    destroy() {
      overlay.remove();
    },

    onCloseButtonPressed(onClose) {
      if (parent) {
        return; // Custom user ui
      }

      addStopButton(overlay, () => {
        onClose();
        overlay.remove();
      });
    }
  };
}
