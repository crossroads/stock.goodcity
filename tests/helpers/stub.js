export function stub(obj, methodName) {
  const original = obj[methodName];

  let invocations = [];
  let mock = (...args) => {
    invocations.push(args);
  };

  mock.restore = () => (obj[methodName] = original);
  mock.invocations = invocations;

  obj[methodName] = mock;
}
