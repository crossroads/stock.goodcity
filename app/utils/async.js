import Ember from "ember";

/**
 * Returns a promise that will resolve the passed value after a certain delay
 *
 * @export
 * @param {any} result
 * @param {number} [delay=300]
 * @returns {Promise<any>}
 */
export function stagerred(result, delay = 300) {
  const deferred = Ember.RSVP.defer();

  Ember.run.later(() => {
    deferred.resolve(result);
  }, delay);

  return deferred.promise;
}

/**
 * Returns a promise that will resolve after the specified time (ms)
 *
 * @export
 * @param {number} [delay=300]
 * @returns {Promise<null>}
 */
export function wait(delay = 300) {
  delay = delay > 0 ? delay : 0;
  return stagerred(null, delay);
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
export function deferredFunc(func, scope, ...args) {
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
    const [promise, trigger] = deferredFunc(func, this, ...args);

    queue.push(trigger);

    if (queue.length === 1) {
      next(); // start
    }

    return promise;
  };
}

/**
 * Prevents a function from being called multiple times, e.g if a user spam clicks a button
 * Once the first call of the function is finished, it can be called again
 *
 * @export
 * @param {function} func the original function to be called
 * @returns {Promise<any>}
 */
export function singleRunner(func) {
  let promise = null;

  return function(...args) {
    if (promise) {
      // A previous call is still running
      return promise;
    }

    promise = Ember.RSVP.resolve(func.apply(this, args));

    return promise
      .then(res => {
        promise = null;
        return res;
      })
      .catch(err => {
        promise = null;
        return Ember.RSVP.reject(err);
      });
  };
}

/**
 * runs the operations in succession
 *
 * @export
 * @param {Function[]} [actions=[]]
 */
export async function chain(actions = []) {
  for (let act of actions) await act();
}

/**
 * Runs the operations with a delay between each action
 *
 * @param {Function[]} [actions=[]]
 * @param {number} [delay=300]
 * @returns
 */
chain.stagerred = function(actions = [], delay = 200) {
  return chain(
    actions.map(act => async () => {
      await act();
      await wait(delay);
    })
  );
};
