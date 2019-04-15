import Ember from "ember";

const LS = window.localStorage;

// --- Helpers

function serialize(data) {
  return JSON.stringify({ data });
}

function deserialize(str) {
  try {
    const obj = JSON.parse(str);
    return obj && obj.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// --- Service

export default Ember.Service.extend({
  read(key, defaultValue) {
    return deserialize(LS.getItem(key)) || defaultValue;
  },

  write(key, val) {
    LS.setItem(key, serialize(val));
    return val;
  },

  remove(key) {
    LS.removeItem(key);
  }
});
