import { ErrorInfo } from '@filesg/design-system';
import { FrameConnector } from '@govtechsg/decentralized-renderer-react-components';
import styled from 'styled-components';

interface StyledFrameConnectorProps {
  height: number;
}

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const FrameConnectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

export const StyledFrameConnector = styled(FrameConnector)<StyledFrameConnectorProps>`
  margin: 0 auto;
  border: 0;
  width: 100%;
  height: ${({ height }) => height}px;
  min-height: ${({ height }) => height}px;

  touch-action: none;
  -ms-touch-action: none;
`;

export const NoPreviewContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  margin: auto;
  height: 372px;
  max-height: 100%;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
`;

export const StyledErrorInfo = styled(ErrorInfo)`
  padding: ${({ theme }) => `${theme.FSG_SPACING.S64}`};
  margin: auto;

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S16, S32 } = theme.FSG_SPACING;
      return S32 + ' ' + S16;
    }};
  }
`;

export const StyledInformationBanner = styled.div`
  display: flex;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};

  padding: ${({ theme }) => {
    const { S16, S48 } = theme.FSG_SPACING;
    return S16 + ' ' + S48;
  }};

  @media screen and (min-width: 600px) and (max-width: 1279px) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S16 + ' ' + S24;
    }};
  }

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
