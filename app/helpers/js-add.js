import { helper as buildHelper } from "@ember/component/helper";

// Date Format used in App:
// "12 Feb '16" => "DD MMM 'YY"

export default buildHelper(function(leftside, rightside) {
  if (rightside) {
    return leftside[0] + leftside[1];
  }
});
