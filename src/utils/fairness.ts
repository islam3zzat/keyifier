const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const REQUESTS_PER_SECOND = 500;

const afterRequetGap = 1_000 / REQUESTS_PER_SECOND;

export const waitForNextRequest = async () => {
  return await sleep(afterRequetGap);
};
