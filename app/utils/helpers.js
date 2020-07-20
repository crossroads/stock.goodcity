export function toID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}

/**
 * Will the func method for each element of setA against each element of setB
 *
 * @export
 * @param {Array} setA
 * @param {Array} setB
 * @param {Function} func
 */
export function times(setA, setB, func) {
  for (const it1 of setA) {
    for (const it2 of setB) {
      func(it1, it2);
    }
  }
}
