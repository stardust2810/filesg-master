import { URL } from 'url';

export function urlToFileAssetUuid(fileUrl: string) {
  const urlObject = new URL(fileUrl);
  const pathArray = urlObject.pathname.split('/');
  return pathArray[pathArray.length - 1];
}
