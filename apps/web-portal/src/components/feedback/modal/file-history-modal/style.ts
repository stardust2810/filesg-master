import { Color, Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledModal = styled(Modal)`
  .ReactVirtualized__Grid__innerScrollContainer {
    box-shadow: none;
  }
`;
export const StyledFileHistoryContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledBody = styled(Modal.Body)`
  padding: 0;
`;

export const StyledHistoricalRecord = styled.div`
  padding: 0.75rem 1.5rem 0 1.5rem;
`;

export const StyledDate = styled.div`
  height: 20px;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  color: ${Color.GREY60};
  margin-bottom: 8px;
`;

export const UserDisplayText = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  min-width: 32px;
  background-color: ${Color.PURPLE_DEFAULT};
  // line-height: 32px;
  color: ${Color.WHITE};
  text-align: center;
`;

export const StyledFileHistoryItem = styled.div`
  display: flex;
  gap: 12px;
`;

export const VirtualizedList = styled.div`
  max-height: 100vh;
  width: 100%;
`;

export const StyledNoRecord = styled.div`
  padding: 1.5rem;
`;
