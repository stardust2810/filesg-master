import { FSGFont, generateEllipsisFileNameParts, Typography } from '@filesg/design-system';

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
  children: fileName,
  overrideFontFamily,
  bold,
  minimumCharCountToEllipsis = 8,
  numberOfRearChar = 4,
}: Props) {
  const extensionPeriodIndex = fileName.lastIndexOf('.');
  const fileNameWithoutExtension = extensionPeriodIndex === -1 ? fileName : fileName.slice(0, extensionPeriodIndex);
  const { front, back } = generateEllipsisFileNameParts(fileName, numberOfRearChar);

  if (fileNameWithoutExtension.length < minimumCharCountToEllipsis) {
    return (
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} whitespace='nowrap'>
        {fileName}
      </Typography>
    );
  }

  return (
    <>
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} isEllipsis ellipsisLine={1} whitespace='pre-wrap'>
        {front}
      </Typography>
      <Typography variant={fontVariant} overrideFontFamily={overrideFontFamily} bold={bold} whitespace='pre'>
        {back}
      </Typography>
    </>
  );
}

export default EllipsisFileName;
