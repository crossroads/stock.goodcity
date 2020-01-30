import { htmlSafe } from "@ember/template";
import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(key) {
  var message = "";
  if (key[0]) {
    var keys = Object.keys(key[0]);
    keys.forEach(record => {
      message +=
        "Undesignating <b>" +
        key[0][record] +
        " </b>quantity from order <b>" +
        record +
        "</b><br/>";
    });
  }
  return new htmlSafe(message);
});
