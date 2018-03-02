export function getPath(obj, path) {
  let steps = path.split('.');
  let val = obj;

  for (let step of steps) {
    // if value is object get key from it
    if (val !== null && typeof val === 'object') {
      val = val[step];
    // if value is not object but there is steps in path return undefined
    } else {
      return;
    }
  }

  return val;
}
