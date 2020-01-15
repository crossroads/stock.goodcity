import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(value) {
  if (value[0]) {
    return value[0].capitalize();
  }
});
