import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("image", "Image Model", {
  needs: ["model:item"]
});

test("check attributess", function(assert) {
  assert.expect(6);

  var model = this.subject();
  var favourite = Object.keys(model.toJSON()).indexOf("favourite") > -1;
  var cloudinaryId = Object.keys(model.toJSON()).indexOf("cloudinaryId") > -1;
  var angle = Object.keys(model.toJSON()).indexOf("angle") > -1;
  var itemId = Object.keys(model.toJSON()).indexOf("itemId") > -1;
  var imageableId = Object.keys(model.toJSON()).indexOf("imageableId") > -1;
  var imageableType = Object.keys(model.toJSON()).indexOf("imageableType") > -1;

  assert.ok(favourite);
  assert.ok(cloudinaryId);
  assert.ok(angle);
  assert.ok(itemId);
  assert.ok(imageableId);
  assert.ok(imageableType);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);
  var Image = this.store().modelFor("image");
  var relationshipWithItem = get(Image, "relationshipsByName").get("item");

  assert.equal(relationshipWithItem.key, "item");
  assert.equal(relationshipWithItem.kind, "belongsTo");
});

test("thumbImageUrl: returns thumb url", function(assert) {
  var image = this.subject({ id: 1 });
  assert.equal(
    image.get("thumbImageUrl"),
    "https://res.cloudinary.com/ddoadcjjl/image/upload/c_fill,fl_progressive,h_120,w_120/v1438323573/default/test_image.jpg"
  );
});
