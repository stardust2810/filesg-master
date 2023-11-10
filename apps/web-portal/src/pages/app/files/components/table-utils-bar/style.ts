import { Bold, Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledTableUtilsBar = styled.div`
  display: flex;
  flex-direction: row;
  min-width: 0;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;
  }
`;
export const StyledTableUtilsRow = styled.div`
  display: flex;
  min-width: 0;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const StyledBold = styled(Bold)`
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
`;

export const StyledTagTypography = styled(Typography)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const StyledFilterTagsContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
`;
