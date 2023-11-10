import styled from 'styled-components';

import { Color } from '../../../styles/color';
import { TextButton } from '../../inputs/text-button';
import { Typography } from '../typography';

interface Styles {
  [key: string]: string;
}

export const StyledContainer = styled.div`
  width: 100%;
`;

export const StyledTextButton = styled(TextButton)`
  background-color: inherit;
  max-width: -webkit-fill-available;
`;

export const StyledHeaderTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StyledHeaderTextButtonContainer = styled.button`
  color: unset;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-style: none;
  background-color: transparent;
  cursor: pointer;
`;

export function rowStyle(fileList, index, selectedItems, color) {
  const defaultStyle: Styles = {};

  if (index === -1) {
    defaultStyle['backgroundColor'] = Color.GREY10;
    defaultStyle['textTransform'] = 'none';
  }

  if (selectedItems.includes(fileList[index]?.id)) {
    defaultStyle['backgroundColor'] = color;
  }

  return defaultStyle;
}

export const StyledFileNameSpan = styled.span`
  display: flex;
`;

export const StyledFileNameEndText = styled(Typography)`
  white-space: nowrap;
  overflow: visible;
`;

export const StyledStatusText = styled(Typography)`
  text-align: center;
`;
