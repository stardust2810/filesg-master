import { Alert, Dropzone } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledDropzone = styled(Dropzone)`
  height: 240px;
`;

export const StyledAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;
