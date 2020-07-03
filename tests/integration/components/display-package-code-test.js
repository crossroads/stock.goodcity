import { moduleForComponent, test } from "ember-qunit";
import hbs from "htmlbars-inline-precompile";

moduleForComponent(
  "display-package-code",
  "Integration | Component | display package code",
  {
    integration: true
  }
);

test("it should render codename with package type", function(assert) {
  this.set("item", {
    code: "ABC",
    name: "Testing "
  });
  this.render(hbs`{{display-package-code item=item}}`);
  assert.equal(
    this.$()
      .text()
      .trim(),
    "ABC - Testing"
  );
});
