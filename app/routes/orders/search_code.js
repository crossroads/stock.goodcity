import { hash } from "rsvp";
import searchCode from "./../search_code";

export default searchCode.extend({
  model(params) {
    var designation = this.store.peekRecord("designation", params.order_id);
    return hash({
      designation:
        designation || this.store.findRecord("designation", params.order_id),
      codes: this.store.query("code", { stock: true })
    });
  }
});
