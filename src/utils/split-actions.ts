export const splitActions = <T>(actions: T[], batchSize = 500) => {
  const batches = [];

  for (let i = 0; i < actions.length; i += batchSize) {
    batches.push(actions.slice(i, i + batchSize));
  }

  return batches;
};
