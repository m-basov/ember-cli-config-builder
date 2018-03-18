// collection helpers
export const isLastIterItem = (iter, lastIdx) =>
  iter.done || lastIdx === iter.value[0];
export const splitPath = (path) => {
  let segmentsArr = path.split('.');
  return {
    segments: segmentsArr.entries(),
    lastIdx: segmentsArr.length - 1
  };
};
