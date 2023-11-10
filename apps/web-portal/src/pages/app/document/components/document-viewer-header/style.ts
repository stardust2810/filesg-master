import styled from 'styled-components';

import { DOCUMENT_VIEW_HEADER_HEIGHT, MOBILE_DOCUMENT_VIEW_HEADER_HEIGHT } from '../../../../../consts';

export const StyledWrapper = styled.div`
  display: flex;
  height: ${DOCUMENT_VIEW_HEADER_HEIGHT / 16}rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  border-bottom: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};

  padding: ${({ theme }) => {
    const { S32, S48 } = theme.FSG_SPACING;
    return '0 ' + S48 + ' 0 ' + S32;
  }};

  @media screen and (max-width: 599px) {
    height: ${MOBILE_DOCUMENT_VIEW_HEADER_HEIGHT / 16}rem;

    padding: ${({ theme }) => {
      const { S8, S16 } = theme.FSG_SPACING;
      return '0 ' + S16 + ' 0 ' + S8;
    }};
  }
`;

export const StyledBackButtonAndFileNameContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledFileNameContainer = styled.div`
  display: flex;
  line-clamp: 1;
`;
