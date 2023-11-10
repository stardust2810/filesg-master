import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  row-gap: 1rem;

  flex: 1;

  max-width: 334px;
  box-sizing: border-box;

  color: #1e1e1e;

  @media screen and (max-width: 599px) {
    padding: 1rem;
    max-width: none;
  }

  @media print {
    padding: 1.5rem;
    padding-left: 0.75rem;
    row-gap: 0.75rem;

    width: calc(300px + 1.5rem + 1.5rem);
  }
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
`;

export const StyledHeaderTitle = styled.span`
  font-family: 'Work Sans';
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;
`;

export const StyledHeaderDescription = styled.span`
  font-family: 'Noto Sans';
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;
`;

export const StyledBodyTitle = styled.span`
  font-family: 'Work Sans';
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5rem;
`;

export const StyledBodyInstructions = styled.div`
  font-family: 'Noto Sans';
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
`;

export const StyledList = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Styled700WeightSpan = styled.span`
  font-weight: 700;
`;

export const StyledListNumber = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  background: #ebebeb;
  color: #6b6b6b;

  width: 1.25rem;
  height: 1.25rem;
  min-width: 1.25rem;
  min-height: 1.25rem;
  border-radius: 1rem;

  font-family: 'Work Sans';
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

export const StyledListText = styled.span`
  font-family: 'Noto Sans';
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

export const StyledQrContainer = styled.div`
  margin: 0 auto;
  height: 180px;

  padding: 1rem;
  background-color: white;
`;
