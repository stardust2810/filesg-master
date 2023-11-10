import fileSGLogo from '../../../assets/logo/filesg-logo.svg';
import { TEST_IDS } from '../../../utils/constants';

export interface Props {
  /**
   * Height(in px) of logo
   */
  height?: number;
}

/**
 * FileSGLogo is an atomic component used for displaying of File SG's application logo.
 */
export const FileSGLogo = ({ height = 30 }: Props) => {
  return (
    <img style={{ maxHeight: '100%', height: `${height}px` }} src={fileSGLogo} data-testid={TEST_IDS.FILESG_APP_LOGO} alt="FileSG logo" />
  );
};
