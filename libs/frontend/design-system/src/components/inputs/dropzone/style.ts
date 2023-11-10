import styled from 'styled-components';

export const StyledDropZone = styled.div<{ isDragActive?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S12};

  height: 100%;
  width: 100%;

  padding: ${({ theme }) => theme.FSG_SPACING.S24};

  border-width: 1px;
  border-style: dashed;
  border-color: ${({ theme, isDragActive }) => (isDragActive ? theme.FSG_COLOR.PRIMARY.LIGHT : theme.FSG_COLOR.GREYS.GREY30)};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  background-color: ${({ theme, isDragActive }) => (isDragActive ? theme.FSG_COLOR.GREYS.GREY10 : 'transparent')};

  & > p,
  & > span {
    text-align: center;
  }
`;
