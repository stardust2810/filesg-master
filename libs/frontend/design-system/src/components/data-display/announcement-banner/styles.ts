import styled from 'styled-components';

import { Tag } from '../tag';
import { BannerType } from '.';

type StylingProps = {
  $type: BannerType;
};

export const StyledDiv = styled.div<StylingProps>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ $type, theme }) => ($type === 'FEATURE_TAG' ? theme.FSG_COLOR.PRIMARY.LIGHTEST : theme.FSG_COLOR.DEFAULT.DARKER)};

  padding: ${({ theme, $type }) => {
    const { S16, S48 } = theme.FSG_SPACING;
    if ($type === 'FEATURE_TAG') {
      return 0 + ' ' + S48;
    }
    return S16 + ' ' + S48;
  }};

  > :not(:last-child) {
    margin-right: ${({ theme, $type }) => {
      const { S16, S12 } = theme.FSG_SPACING;
      if ($type === 'FEATURE_TAG') {
        return S12;
      }
      return S16;
    }};
  }

  // prettier-ignore
  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px))
    and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET}) {
    padding: ${({ theme, $type }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    if ($type === 'FEATURE_TAG') {
      return 0 + ' ' + S24;
    }
    return S16 + ' ' + S24;
  }};
  }

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme, $type }) => {
      const { S16 } = theme.FSG_SPACING;
      if ($type === 'FEATURE_TAG') {
        return 0 + ' ' + S16;
      }
      return S16;
    }};

    > :not(:last-child) {
      margin-right: ${({ theme }) => theme.FSG_SPACING.S12};
    }
  }
`;

export const StyledTextColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

export const StyledTag = styled(Tag)`
  margin: ${({ theme }) => {
    const { S8 } = theme.FSG_SPACING;
    return `${S8} 0`;
  }};
`;

export const StyledFeatureTagTextContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  padding: ${({ theme }) => {
    const { S16 } = theme.FSG_SPACING;
    return `${S16} 0`;
  }};
`;
