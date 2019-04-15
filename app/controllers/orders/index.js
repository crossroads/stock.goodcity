import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({
  searchModelName: "designation",
  unloadAll: true,
  minSearchTextLength: 2,
  queryParams: ["preload"]
});
