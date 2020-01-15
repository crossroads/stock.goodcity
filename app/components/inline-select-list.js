import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import SelectList from "./select-list";

export default SelectList.extend({
  layoutName: "components/select-list",
  store: service(),

  selectedValue: computed("name", "item.grade", function() {
    const name = this.get("name");
    const val = this.get(`item.${name}`);

    if (this.get("isPrimitive")) {
      return { id: val, name: val };
    }
    return val;
  }),

  change() {
    let item = this.get("item");
    let key = this.get("name");
    let val = this.get("selectedValue");

    if (this.get("isPrimitive")) {
      item.set(key, val.name);
    } else {
      item.set(key, val);
    }

    if (this.get("autosave")) {
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      item.save().finally(() => loadingView.destroy());
    }
  }
});
