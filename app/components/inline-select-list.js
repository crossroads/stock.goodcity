import Ember from "ember";
import SelectList from "./select-list";
const { getOwner } = Ember;

export default SelectList.extend({
  layoutName: "components/select-list",
  store: Ember.inject.service(),

  selectedValue: Ember.computed("name", "item.grade", function() {
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
      item.set(key, val.id);
    } else {
      item.set(key, val);
    }

    if (this.get("autosave")) {
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      item.save().finally(() => {
        loadingView.destroy();
      });
    }
  }
});
