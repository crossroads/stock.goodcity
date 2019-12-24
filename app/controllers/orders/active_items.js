import detail from "./detail";

export default detail.extend({
  cancellationReason: [],
  cancellationReasonId: Ember.computed("cancellationReason", {
    get() {
      const cancellationReason = this.get("cancellationReason");
      return cancellationReason.get("firstObject.id");
    },
    set(key, value) {
      return value;
    }
  }),

  actions: {
    cancelOrder() {
      debugger;
    }
  }
});
