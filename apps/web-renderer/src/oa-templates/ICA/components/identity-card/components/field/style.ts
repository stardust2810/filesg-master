import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1rem 0;
  width: 100%;

  font-family: Poppins;
  font-weight: 400;
  text-transform: uppercase;

  &:first-child {
    margin: 0;
  }
`;

export const Title = styled.div`
  font-size: 0.75rem;
  line-height: 1rem;
  color: #4F4F4F;
  width: 100%;
`;

export const Value = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;

  width: 100%;
  color: #141414;
`;
