import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(value) {
  return Array.isArray(value[0]);
});
