declare module 'crypto' {
  function generateKey(
    type: 'aes',
    options: {
      length: number;
    },
    callback: (err, key) => void,
  ): void;
}
