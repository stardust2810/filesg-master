import styled from 'styled-components';

import { ComponentProps } from '.';

type StyledProps = Required<ComponentProps>;

export const StyledHr = styled.hr<StyledProps>`
  margin-top: ${({ verticalOffset }) => verticalOffset}px;
  margin-bottom: ${({ verticalOffset }) => verticalOffset}px;

  margin-left: ${({ horizontalOffset }) => horizontalOffset}px;
  margin-right: ${({ horizontalOffset }) => horizontalOffset}px;

  border: none;
  ${({ isVertical, theme, thick }) => {
    if (isVertical) {
      return `
        border-left: ${thick ? 4 : 1}px solid ${thick ? theme.FSG_COLOR.GREYS.GREY20 : theme.FSG_COLOR.GREYS.GREY30};
        height: 100%;
      `;
    }
    return `border-top: ${thick ? 4 : 1}px solid ${thick ? theme.FSG_COLOR.GREYS.GREY20 : theme.FSG_COLOR.GREYS.GREY30};`;
  }}
`;

export const StyledTextDivider = styled.div`
  font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  font-weight: bold;

  ::before,
  ::after {
    flex: 1;
    content: '';
    font-weight: 400;
    height: 1px;
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
    margin: ${({ theme }) => theme.FSG_SPACING.S16} 0;
  }

  ::before {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
  ::after {
    margin-left: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
