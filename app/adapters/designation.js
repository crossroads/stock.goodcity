import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  // Intercept the update method of designations, to send the data with the 'order' name instead
  updateRecord(store, type, snapshot) {
    let data = this.serialize(snapshot, { includeId: true });
    const url = this.buildURL('order', snapshot.id, snapshot, 'updateRecord');
    return this.ajax(url, 'PUT', { data: { 'order' : data } });
  }
});
