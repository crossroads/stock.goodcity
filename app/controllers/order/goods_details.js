import Ember from "ember";
import config from "../../config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  goodcityRequestService: Ember.inject.service(),

  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  isMobileApp: config.cordova.enabled,

  hasNoGcRequests: Ember.computed(
    "goodcityRequests.[]",
    "goodcityRequests.@each.code",
    function() {
      return (
        !this.get("goodcityRequests").length ||
        this.get("goodcityRequests").filter(gr => gr.code).length !==
          this.get("goodcityRequests").length
      );
    }
  ),

  async createGoodsDetails(params, index) {
    const data = await this.get("goodcityRequestService").createGcRequest({
      ...params
    });
    const goodcityRequests = this.get("goodcityRequests");
    goodcityRequests[index].id = data["goodcity_request"]["id"];
    this.set("goodcityRequests", [...goodcityRequests]);
  },

  async updateGoodsDetails(id, params) {
    await this.get("goodcityRequestService").updateGcRequest(id, params);
  },

  actions: {
    async onRemoveRequest(_id, index) {
      this.set("goodcityRequests", [
        ...this.get("goodcityRequests").slice(0, index),
        ...this.get("goodcityRequests").slice(index + 1)
      ]);
    },

    async addRequest() {
      const goodcityRequest = {
        description: "",
        quantity: 1,
        packageType: null
      };
      this.set("goodcityRequests", [
        ...this.get("goodcityRequests"),
        goodcityRequest
      ]);
    },

    async saveGoodsDetails() {
      if (this.get("hasNoGcRequests")) {
        return false;
      }

      const orderId = this.get("order.id");
      const goodcityRequests = this.get("goodcityRequests");
      await this.runTask(
        Promise.all(
          goodcityRequests.map(async (gr, index) => {
            const params = {
              package_type_id: gr.code.get("id"),
              quantity: gr.quantity,
              order_id: orderId,
              description: gr.description
            };
            if (!gr.id) {
              return this.createGoodsDetails(params, index);
            } else {
              return this.updateGoodsDetails(gr.id, params);
            }
          })
        ),
        ERROR_STRATEGIES.MODAL
      );

      this.transitionToRoute("order.appointment_details", this.get("order.id"));
    }
  }
});
