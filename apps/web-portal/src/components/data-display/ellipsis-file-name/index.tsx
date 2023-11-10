import { FSGFont, Typography } from '../../../../../../libs/frontend/design-system/src';
import { formatFileExtensionAndLastChars, formatFileNameWithoutExtensionAndLastChars } from '../../../utils/common';

interface Props {
  children: string;
  fontVariant: keyof FSGFont;
  overrideFontFamily?: 'Work Sans'; // Note: this is standalone use for H3 and BODY typography
  bold?: 'FULL' | 'SEMI' | 'MEDIUM';
  minimumCharCountToEllipsis?: number;
  numberOfRearChar?: number;
}

function EllipsisFileName({
  fontVariant,
  children: fileNameWithExtension,
  overrideFontFamily,
  bold,
  minimumCharCountToEllipsis = 8,
  numberOfRearChar = 4,
}: Props) {
  const extensionPeriodIndex = fileNameWithExtension.lastIndexOf('.');
  const fileNameWithoutExtension =
    extensionPeriodIndex === -1 ? fileNameWithExtension : fileNameWithExtension.slice(0, extensionPeriodIndex);

  if (fileNameWithoutExtension.length < minimumCharCountToEllipsis) {
    return (
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} noWrap>
        {fileNameWithExtension}
      </Typography>
    );
  }

  return (
    <>
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} isEllipsis ellipsisLine={1}>
        {formatFileNameWithoutExtensionAndLastChars(fileNameWithExtension, numberOfRearChar)}
      </Typography>
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} noWrap>
        {formatFileExtensionAndLastChars(fileNameWithExtension, numberOfRearChar)}
      </Typography>
    </>
  );
}

export default EllipsisFileName;
