import styled from 'styled-components';

import { Props } from '.';
type ColProps = Pick<Props, 'column' | 'offset'>;

export const StyledCol = styled.div<ColProps>`
  padding: 0;

  ${({ column }) => (column ? `width: ${(column / 12) * 100}%;` : `flex: 1;`)}

  margin-left: ${({ offset }) => ((offset ?? 0) / 12) * 100}%;
`;
