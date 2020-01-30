import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  grades: computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  })
});
