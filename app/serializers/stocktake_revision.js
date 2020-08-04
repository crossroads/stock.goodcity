import ApplicationSerializer from "./application";

export default ApplicationSerializer.extend({
  keyForRelationship(key, typeClass, method) {
    if (method === "serialize" && key === "item") {
      return "package_id";
    }
    return this._super(...arguments);
  }
});
