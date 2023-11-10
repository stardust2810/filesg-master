import styled from 'styled-components';

export const StyledWrapper = styled.div`
  border: ${({ theme }) => `2px solid ${theme.FSG_COLOR.INFO.LIGHTER}`};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};

  > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S24 + ' ' + S16;
  }};

  padding-top: 0;
`;
