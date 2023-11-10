export declare global {
  interface Window {
    wogaaCustom?: {
      startTransactionalService: (id: string) => void;
      completeTransactionalService: (id: string) => void;
    };
  }
}
