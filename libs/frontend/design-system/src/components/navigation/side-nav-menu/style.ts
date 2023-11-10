import styled from 'styled-components';

export const StyledNavMenu = styled.ul`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  height: 100%;
  width: 100%;
`;
