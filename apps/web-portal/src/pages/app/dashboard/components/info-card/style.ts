import { Color, Typography } from '@filesg/design-system';
import styled from 'styled-components';

type ColorProps = {
  background: Color;
  color: Color;
  $borderColor: Color;
};

export const StyledLink = styled.a<ColorProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  width: 100%;
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  background: ${({ background }) => background};
  color: ${({ color }) => color};

  &:hover {
    box-shadow: ${({ $borderColor }) => `inset 0 0 0 2px ${$borderColor}`};
    color: ${({ color }) => color};
  }
`;
export const StyledCardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const StyledTypogrpahy = styled(Typography)`
  line-height: ${({ theme }) => theme.FSG_SPACING.S20};

  column-gap: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledImg = styled.img`
  height: ${({ theme }) => theme.FSG_SPACING.S96};
  width: ${({ theme }) => theme.FSG_SPACING.S96};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledTag = styled(Typography)`
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S8};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S12};
  background-color: ${Color.WHITE};
  width: fit-content;
`;
