import styled from 'styled-components';

import { Col } from '../../layout/col';
import { Container } from '../../layout/container';

export const StyledContainer = styled(Container)`
  width: 100%;
  overflow: hidden;
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTEST};

  > :not(:last-child) {
    margin-bottom: 0.5rem;
  }

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S24 + ' ' + S16;
  }};
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S24};
  margin: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S12};
`;

export const StyledColumnsContainer = styled.div`
  background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTER};
  border: solid 1px black;
`;

export const StyledCol = styled(Col)`
  background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTEST};
  box-shadow: 0 0 1px 0 black;

  padding: ${({ theme }) => theme.FSG_SPACING.S12};
`;
