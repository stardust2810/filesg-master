import styled from 'styled-components';

export const StyledWrapper = styled.div`
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
`;

export const StyledSignupFormWrapper = styled.div`
  flex: 3;
  min-width: 0;
  display: flex;
`;

export const StyledMarketingContainer = styled.div`
  flex: 2;
  min-width: 0;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  display: flex;
`;
