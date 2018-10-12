import Ember from 'ember';
import SearchCode from '../search_code';

export default SearchCode.extend({
  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("orders.requested_items", this.get("orderId"));
    },

    addRequest(packageType) {
      var requestId = this.get("reqId");
      var changeCode = this.get("changeCode");
      if(requestId && changeCode) {
        this.send("updateRequestCode", packageType, requestId);
      } else {
        var orderId = this.get("orderId");
        this.transitionToRoute('orders.add_request', orderId, { queryParams: { orderId: orderId, packageTypeId: packageType.id } });
      }
    }
  }
});
