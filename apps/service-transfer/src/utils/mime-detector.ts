const extentionType: { [key: string]: string } = {
  'image/jpeg': '.jpg', //.jpeg .jpg
  'image/png': '.png',
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/json': '.oa',
};

export function getFileTypeFromMimeType(mimeType: string) {
  return extentionType[mimeType].replaceAll('.', '');
}
