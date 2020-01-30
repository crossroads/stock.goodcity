import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(leftside) {
  return leftside[0] > leftside[1] + 1 ? true : false;
});
