function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const sleepInSecs = async (sec: number) => {
  return sleep(sec * 1000);
};
