/**
 * xlsx-populate has no @typings/xlsx-populate while xlsx-populate-types is not easily used.
 * Doing a bare minimum custom typing for xlsx-populate workbook encryption
 */
declare module 'xlsx-populate' {
  interface ReadFileOptions {
    password?: string;
  }

  interface WriteFileOptions {
    password?: string;
  }

  function fromFileAsync(path: string, opts?: ReadFileOptions): Promise<Workbook>;

  class Workbook {
    toFileAsync(path: string, opts?: WriteFileOptions): Promise<void>;
  }
}
