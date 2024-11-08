export const splitArray = <T>(array: T[], batchSize = 500) => {
  const batches = [];

  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }

  return batches;
};
