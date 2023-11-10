import { css } from 'styled-components';

export const addGapBetweenChildren = (direction: 'HORIZONTAL' | 'VERTICAL', gapSpacing: string) => {
  if (direction === 'HORIZONTAL') {
    return css`
      > :not(:last-child) {
        margin-right: ${gapSpacing};
      }
    `;
  }
  return css`
    > :not(:last-child) {
      margin-bottom: ${gapSpacing};
    }
  `;
};
