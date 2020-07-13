import applicationSerializer from "./application";

export default applicationSerializer.extend({
  serialize(snapshot, options) {
    let json = this._super(...arguments);

    json.package_id = json.item_id;

    delete json["item_id"];

    return json;
  }
});
