import applicationSerializer from "./application";

export default applicationSerializer.extend({
  serialize(snapshot, options) {
    let json = this._super(...arguments);
    // Dont change the sequence of these two lines below.
    json.stockit_organisation_id = json.organisation_id;
    json.organisation_id = json.gc_organisation_id;
    return json;
  }
});