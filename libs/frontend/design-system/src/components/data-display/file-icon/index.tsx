import { TEST_IDS } from '../../../utils/constants';
import { FILE_ICON_VARIANT, FILE_TYPE, FileSGProps } from '../../../utils/typings';
import { StyledSpan } from './style';

export type Props = {
  /**
   * Extension of the file
   */
  type: FILE_TYPE;
  /**
   * Size of the icon
   */
  size?: 'ICON_NORMAL' | 'ICON_SMALL' | 'ICON_LARGE' | 'ICON_MINI';
  /**
   * Style variant of the icon
   */
  variant: FILE_ICON_VARIANT;
} & FileSGProps;

function fileTypeIconMapper(type: FILE_TYPE) {
  switch (type) {
    case 'oa':
      return {
        solid: 'fsg-icon-file-openattest-solid',
        outline: 'fsg-icon-file-openattest-outline',
        mini: 'fsg-icon-file-openattest-mini',
      };
    case 'pdf':
      return {
        solid: 'fsg-icon-file-pdf-solid',
        outline: 'fsg-icon-file-pdf-outline',
        mini: 'fsg-icon-file-pdf-mini',
      };
    case 'jpg':
    case 'jpeg':
      return {
        solid: 'fsg-icon-file-jpg-solid',
        outline: 'fsg-icon-file-jpg-outline',
        mini: 'fsg-icon-file-jpg-mini',
      };
    case 'png':
      return {
        solid: 'fsg-icon-file-png-solid',
        outline: 'fsg-icon-file-png-outline',
        mini: 'fsg-icon-file-png-mini',
      };
    case 'zip':
      return {
        solid: 'fsg-icon-file-zip-solid',
        outline: 'fsg-icon-file-zip-outline',
      };
    default:
      return {
        solid: 'fsg-icon-file-unknown-solid',
        outline: 'fsg-icon-file-unknown-outline',
      };
  }
}

/**
 * FileIcon is a atomic component used to display an icon that represents specific file format
 */
export const FileIcon = ({ size = 'ICON_NORMAL', type, variant, className, ...rest }: Props): JSX.Element => {
  const iconClass = fileTypeIconMapper(type)[variant] ?? fileTypeIconMapper(type).solid;

  const getIconAlt = `${type.toUpperCase()} file format icon`;
  return (
    <StyledSpan
      className={` ${iconClass} ${className}`}
      size={size}
      role="img"
      aria-label={getIconAlt}
      data-testid={rest['data-testid'] ?? TEST_IDS.FILE_ICON}
      {...rest}
    />
  );
};
