import styled from 'styled-components';

interface StyledInputProps {
  error?: boolean;
  success?: boolean;
}

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledInputAndButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;

    > *:not(:last-child) {
      margin-right: 0;
    }
    > *:not(:last-child) {
      margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }
`;

export const StyledInput = styled.input<StyledInputProps>`
  flex: 1;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  padding: ${({ theme }) => {
    const { S12, S16 } = theme.FSG_SPACING;
    return S12 + ' ' + S16;
  }};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  border: 1px solid;
  border-color: ${({ theme, error, success }) => {
    if (error) {
      return theme.FSG_COLOR.DANGER.DEFAULT;
    }
    if (success) {
      return theme.FSG_COLOR.SUCCESS.DEFAULT;
    }
    return theme.FSG_COLOR.GREYS.GREY30;
  }};

  font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
  font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
  line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};

  &:hover {
    border: 1px solid ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHT};
  }

  &:active {
    border: 1px solid ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};

    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY50};
  }
`;
