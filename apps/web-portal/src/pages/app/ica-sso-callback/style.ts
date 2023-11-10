import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  width: 100%;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;
