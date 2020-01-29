import { later } from "@ember/runloop";
import { defer } from "rsvp";

export function stagerred(result, delay = 300) {
  const deferred = defer();

  later(() => {
    deferred.resolve(result);
  }, delay);

  return deferred.promise;
}

export function wait(delay = 300) {
  return stagerred(null, delay);
}
