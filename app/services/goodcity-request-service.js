import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  async createGcRequest(gcRequestParams) {
    const gcRequest = await this.POST(`/goodcity_requests`, {
      goodcity_request: gcRequestParams
    });
    this.get("store").pushPayload(gcRequest);
    return gcRequest;
  },

  async updateGcRequest(reqId, gcRequestParams) {
    const gcRequest = await this.PUT(`/goodcity_requests/${reqId}`, {
      goodcity_request: gcRequestParams
    });
    this.get("store").pushPayload(gcRequest);
    return this.get("store").peekRecord("goodcity_request", reqId);
  },

  deleteRequest(reqId) {
    return this.DELETE(`/goodcity_requests/${reqId}`).then(gcRequest => {
      this.get("store").pushPayload(gcRequest);
    });
  }
});
