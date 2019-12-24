import $ from "jquery";
import SearchCode from "../search_code";

export default SearchCode.extend({
  back() {
    window.history.back();
  },

  actions: {
    cancelSearch() {
      $("#searchText").blur();
      this.send("clearSearch", true);
      this.back();
    },

    async addRequest(packageType) {
      const requestId = this.get("reqId");
      const changeCode = this.get("changeCode");

      if (requestId && changeCode) {
        await this.updateRequestCode(packageType, requestId);
        this.back();
      } else {
        const orderId = this.get("orderId");
        this.replaceRoute("orders.add_request", orderId, {
          queryParams: {
            orderId: orderId,
            packageTypeId: packageType.id
          }
        });
      }
    }
  }
});
