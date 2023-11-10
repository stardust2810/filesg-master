import { IconLabel } from '@filesg/design-system';
import OtpInput from 'react-otp-input';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledResendOtpWrapper = styled.div`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S4};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledOtpInput = styled(OtpInput)`
  > input {
    height: ${({ theme }) => theme.FSG_SPACING.S64};
    width: ${({ theme }) => theme.FSG_SPACING.S40} !important;

    border: 1px solid;
    border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
    border-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
    outline: none;

    font-family: Noto Sans;
    font-weight: 400;
    font-size: ${({ theme }) => theme.FSG_SPACING.S24};
    line-height: ${({ theme }) => theme.FSG_SPACING.S32};
    text-align: center;
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
    padding: 0 1px;
  }

  :not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
  }

  :nth-child(6) {
    margin-right: 0px;
  }
`;

export const StyledIconLabel = styled(IconLabel)`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledOtpWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
`;
