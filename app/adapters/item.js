import ApplicationAdapter from "./application";

export default ApplicationAdapter.extend({
  // Intercept the update method of items, to send the data with the 'package' name instead
  updateRecord(store, type, snapshot) {
    let data = this.serialize(snapshot, { includeId: true });
    const url = this.buildURL("package", snapshot.id, snapshot, "updateRecord");
    return this.ajax(url, "PUT", { data: { package: data } });
  }
});
