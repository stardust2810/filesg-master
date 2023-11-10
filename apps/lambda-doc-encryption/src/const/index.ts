import { v1 } from 'uuid';
const UNZIP_DIR = '/tmp/extracted';

export const getTargetUnzipDirectory = () => {
  return `${UNZIP_DIR}/${v1()}`;
};
