import { FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';

import { StyledPageContainer, StyledPageContent, StyledPageContentWrapper } from './style';

type Props = {
  children: JSX.Element;
  columnSize?: 6 | 8 | 12;
};
/**
 * This component is used for verification page and retrieval page
 * @param children
 * @returns
 */
const PublicPageContainer = ({ children, columnSize }: Props) => {
  const isSmallerThanSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_DESKTOP);
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  const getContentCol = () => {
    if (isSmallerThanNormalTabletLandscape) {
      return 12;
    }
    if (isSmallerThanSmallDesktop) {
      return 8;
    }
    return 6;
  };

  return (
    <StyledPageContentWrapper>
      <StyledPageContainer>
        <StyledPageContent column={columnSize ?? getContentCol()}>{children}</StyledPageContent>
      </StyledPageContainer>
    </StyledPageContentWrapper>
  );
};

export default PublicPageContainer;
