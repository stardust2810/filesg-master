import styled from 'styled-components';

import { Typography } from '../../data-display/typography';
export const FileLoader = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  #folder-base {
    fill: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTER};
  }
  #folder-top {
    fill: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTEST};
  }

  #file-1 {
    fill: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
    width: 80px;
    height: 40px;
    animation: inspect-file-1 3s ease-in-out;
    animation-iteration-count: infinite;
  }
  @keyframes inspect-file-1 {
    0% {
      transform: translateY(0);
    }
    33% {
      transform: translateY(0);
    }
    39% {
      transform: translateY(-16px);
    }
    44% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  }
  #file-2 {
    fill: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
    width: 76px;
    height: 40px;
    animation: inspect-file-2 3s ease-in-out;
    animation-iteration-count: infinite;
  }
  @keyframes inspect-file-2 {
    0% {
      transform: translateY(0);
    }
    44% {
      transform: translateY(0);
    }
    49% {
      transform: translateY(-16px);
    }
    55% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  }
  #file-3 {
    fill: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
    width: 72px;
    height: 40px;
    animation: inspect-file-3 3s ease-in-out;
    animation-iteration-count: infinite;
  }
  @keyframes inspect-file-3 {
    0% {
      transform: translateY(0);
    }
    55% {
      transform: translateY(0);
    }
    60% {
      transform: translateY(-16px);
    }
    66% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export const FileLoaderText = styled(Typography)`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
`;
