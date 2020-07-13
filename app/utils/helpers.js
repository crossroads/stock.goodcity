import Ember from "ember";

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

/**
 * Returns a promise and a trigger to start the job
 *
 * @export
 * @param {Function} func the job to execute
 * @param {any} scope the scope to bind the function to
 * @param {...any} args arguments
 * @returns {array} [promise, job]
 */
export function useDefer(func, scope, ...args) {
  const deferred = Ember.RSVP.defer();

  const trigger = async () => {
    try {
      const res = await func.apply(scope, args);
      deferred.resolve(res);
    } catch (e) {
      deferred.reject(e);
    }
  };

  return [deferred.promise, trigger];
}

/**
 * Returns a function that cannot run in parallel, any subsequent call will be queued
 *
 * @export
 * @param {function} func
 * @returns {function} a queued version of func
 */
export function queued(func) {
  let queue = [];

  const next = async () => {
    if (queue.length) {
      await queue[0]();
      queue.shift();
      next();
    }
  };

  return function(...args) {
    const [promise, job] = useDefer(func, this, ...args);

    queue.push(job);

    if (queue.length === 1) {
      next(); // start
    }

    return promise;
  };
}
