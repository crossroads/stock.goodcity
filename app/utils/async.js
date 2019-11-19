import Ember from "ember";

export function stagerred(result, delay = 300) {
  const deferred = Ember.RSVP.defer();

  Ember.run.later(() => {
    deferred.resolve(result);
  }, delay);

  return deferred.promise;
}

export function wait(delay = 300) {
  return stagerred(null, delay);
}
