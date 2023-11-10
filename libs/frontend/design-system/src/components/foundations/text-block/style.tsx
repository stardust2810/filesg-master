import styled from 'styled-components';

import { Container } from '../../layout/container';

export const StyledContainer = styled(Container)`
  width: 100%;
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

export const StyledTypographyContainer = styled.div`
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: 2.5rem;
  }
`;

export const StyledTypographyInfoContainer = styled.div`
  display: flex;
`;

export const StyledTypeDetailsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: 1rem;
  }
`;

export const StyledTypeDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  > :not(:last-child) {
    margin-right: 1.5rem;
  }
`;

export const StyledTypeDetailsField = styled.div`
  width: 172px;
  display: flex;
  flex-direction: column;
`;

export const StyledTypographyExampleContainer = styled.div`
  flex: 1;
`;
