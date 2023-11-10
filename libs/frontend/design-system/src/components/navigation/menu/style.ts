import styled from 'styled-components';

export const StyledMenuContainer = styled.div`
  width: max-content;

  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.1);
`;
