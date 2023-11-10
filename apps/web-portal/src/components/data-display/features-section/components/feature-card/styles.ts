import { Button, Col } from '@filesg/design-system';
import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const StyledFeatureCardWrapper = styled.div<{ $isImageAtLeft: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: ${({ $isImageAtLeft }) => ($isImageAtLeft ? 'row-reverse' : 'row')};
  justify-content: start;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    flex-direction: column-reverse;
  }
`;
export const StyledButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledFeatureDescriptorWrapper = styled(animated.div)`
  display: flex;
  flex-direction: column;
`;

export const StyledFeatureTitleWrapper = styled.span`
  padding: ${({ theme }) => theme.FSG_SPACING.S16} 0;
`;

export const StyledFeatureDescriptionWrapper = styled.span`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledFeatureTagWrapper = styled.span`
  padding: ${({ theme }) => theme.FSG_SPACING.S16} 0;
`;

export const StyledIllustrationWrapper = styled(Col)`
  display: flex;
  justify-content: center;
`;

export const StyledIllustration = styled.img`
  width: 100%;
  max-width: 584px;
`;
