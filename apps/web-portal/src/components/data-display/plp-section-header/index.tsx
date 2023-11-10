import { Color, FileSGProps, FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';

import { StyledDescription, StyledHeaders, StyledSectionHeader } from './styles';

type Props = {
  title: string;
  description?: string;
  isCentered?: boolean;
} & FileSGProps;

export const SectionHeader = ({ title, description, isCentered = false, className, style }: Props): JSX.Element => {
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  return (
    <StyledSectionHeader $isCentered={isCentered} style={style} className={className}>
      <StyledHeaders variant={isSmallerThanNormalTabletLandscape ? 'H2' : 'DISPLAY2'} bold="FULL">
        {title}
      </StyledHeaders>
      {description && (
        <StyledDescription variant={isSmallerThanNormalTabletLandscape ? 'BODY' : 'PARAGRAPH'} color={Color.GREY60}>
          {description}
        </StyledDescription>
      )}
    </StyledSectionHeader>
  );
};
