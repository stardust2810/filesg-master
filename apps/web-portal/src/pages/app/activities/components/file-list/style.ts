import { Color } from '@filesg/design-system';
import styled from 'styled-components';

export const FilesWrapper = styled.div`
  max-width: 100%;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const StyledCircle = styled.div`
  height: 32px;
  width: 32px;
  border-radius: 16px;
  border: 1px solid ${Color.GREY30};
  display: flex;
  align-items: center;
  justify-content: center;
`;
