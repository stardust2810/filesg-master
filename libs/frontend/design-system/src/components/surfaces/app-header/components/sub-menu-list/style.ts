import styled from 'styled-components';

import { List } from '../../../../data-display/list';

export const StyledList = styled(List)`
  .fsg-list-item {
    height: fit-content;
    padding: ${({ theme }) => {
      const { S12, S24 } = theme.FSG_SPACING;
      return `${S12} ${S24}`;
    }};

    span {
      font-weight: normal;
      color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
      font-family: 'Noto Sans';
    }

    &:hover {
      background-color: inherit;
      span {
        color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
      }
    }
    &.active span {
      font-weight: 700;
    }
  }
`;
