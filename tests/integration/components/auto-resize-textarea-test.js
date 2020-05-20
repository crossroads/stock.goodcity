import { test, moduleForComponent } from "ember-qunit";
import startApp from "../../helpers/start-app";
import Ember from "ember";
import hbs from "htmlbars-inline-precompile";

var App;

moduleForComponent(
  "auto-resize-textarea",
  "Integration | Component | auto resize textarea",
  {
    integration: true,
    beforeEach: function() {
      App = startApp({}, 2);
      this.render(hbs`{{auto-resize-textarea id="description"}}`);
    },
    afterEach: function() {
      Ember.run(App, "destroy");
    }
  }
);

test("is an textarea tag", function(assert) {
  assert.expect(1);
  assert.equal($("#description").prop("tagName"), "TEXTAREA");
});

test("is of textarea type", function(assert) {
  assert.expect(1);
  assert.equal($("#description")[0].type, "textarea");
});
