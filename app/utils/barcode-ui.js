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

/**
 *
 * @param {JQuery<HTMLElement>} parent
 */
function resolveButtonContainer(parent) {
  let container = parent.find(".button-container");

  if (container.length === 0) {
    const el = Ember.$('<div class="button-container"></div>');
    el.css({
      "z-index": "1000",
      position: "relative",
      display: "flex",
      "justify-content": "space-around",
      margin: "20px auto"
    });

    parent.append(el);
    return parent.find(".button-container");
  }

  return container;
}

function createButton(parent, content, callback) {
  const button = Ember.$("<div></di>");

  button.html(content);
  button.css({
    "min-width": "70px",
    height: "30px",
    "background-color": "white",
    color: "black",
    padding: "5px",
    "border-radius": "50px",
    "z-index": "1000",
    position: "relative",
    "line-height": "20px",
    "text-align": "center"
  });

  button.on("click", callback);
  resolveButtonContainer(parent).append(button);

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

    addButton(content, callback) {
      if (parent) {
        return; // Custom user ui
      }
      createButton(overlay, content, callback);
    }
  };
}
