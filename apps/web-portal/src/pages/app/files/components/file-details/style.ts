import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContainer = styled.div``;

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledFilePreviewContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 160px;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  border-radius: 8px;
  margin: ${({ theme }) => theme.FSG_SPACING.S16 + ' ' + 0};
`;

export const StyledPreviewFile = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 92px;
  height: 128px;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  box-shadow: 0px 3px 3px 0px #0000001a;
`;

export const StyledFolderImage = styled.img`
  width: 5.75rem;
  height: 5.75rem;
`;

export const StyledPreviewFileShadow = styled.div`
  width: 4px;
  height: 120px;
  background-color: #c4c4c4;
  margin-left: 4px;
`;

export const StyledPreviewFileDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S4};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};

  &:last-child {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const StyledCapitalizedText = styled(Typography)`
  overflow-wrap: break-word;
  text-transform: capitalize;
`;

export const StyledText = styled(Typography)`
  overflow-wrap: break-word;
`;
