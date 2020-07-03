export function toID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}
