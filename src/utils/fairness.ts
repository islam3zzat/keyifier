const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const afterRequetGap = 5;
export const UPDATE_BATCH_SIZE = 15;

export const waitForNextRequest = async () => {
  return await sleep(afterRequetGap);
};
