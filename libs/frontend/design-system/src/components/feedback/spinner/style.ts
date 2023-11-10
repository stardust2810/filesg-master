import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledSpinnerSvg = styled.svg`
  display: flex;
  margin: auto;
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};

  width: 80px;
  height: 80px;
  animation: rotate 1s ease-in infinite;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(90deg);
    }
    50% {
      transform: rotate(180deg);
    }
    75% {
      transform: rotate(270deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const StyledGradiant = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-image: conic-gradient(from 90deg, #ebeafa 0%, #afabed 50%, #736bdf 100%);
`;
