import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(value) {
  var parseDate = Date.parse(value);
  return moment(parseDate).fromNow();
});
