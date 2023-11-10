/* eslint-disable security/detect-object-injection */
import styled from 'styled-components';

import { Props } from '.';

type StyledProps = Pick<Props, 'iconBackgroundColor' | 'gap' | 'iconPaddingTop'>;

export const StyledWrapper = styled.div<{ alignment: 'DEFAULT' | 'CENTER' | 'BASELINE' }>`
  display: flex;
  align-items: ${({ alignment }) => {
    switch (alignment) {
      case 'BASELINE':
        return 'baseline';

      case 'CENTER':
        return 'center';

      default:
        return '';
    }
  }};
`;

export const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const StyledIconBorder = styled.span<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  padding: ${({ iconBackgroundColor, theme }) => {
    if (!iconBackgroundColor) {
      return '0px';
    }
    return theme.FSG_SPACING.S12;
  }};
  height: fit-content;

  background-color: ${({ iconBackgroundColor }) => {
    if (!iconBackgroundColor) {
      return '';
    }
    return iconBackgroundColor;
  }};

  margin-right: ${({ gap }) => gap};

  ${({ iconPaddingTop }) => iconPaddingTop && `padding-top: ${iconPaddingTop}`};
`;
