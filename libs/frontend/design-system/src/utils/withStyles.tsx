import 'sgds-govtech/css/sgds.css';

import styled from 'styled-components';

import { GlobalStyles } from '../styles/global';

export function WithStyles(WrappedComponent: any): JSX.Element {
  return (
    <StyledDiv id="root">
      <GlobalStyles />
      <WrappedComponent />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  height: auto !important;
`;
