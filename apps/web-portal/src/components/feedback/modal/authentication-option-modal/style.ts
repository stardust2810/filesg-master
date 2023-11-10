import { Button } from '@filesg/design-system';
import styled from 'styled-components';

import PoppinsFont from '../../../../assets/fonts/poppins/poppins-v19-latin-700.woff';
import PoppinsFont2 from '../../../../assets/fonts/poppins/poppins-v19-latin-700.woff2';

export const StyledOption = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.0625rem solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  row-gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const NonSingpassButton = styled(Button)``;

export const SingpassButton = styled.button`
  background-color: #cf0b15;
  color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border: none;
  border-radius: 0.5rem;
  padding: 10px;
  text-align: center;
  height: auto;
  font-family: Poppins;
  font-weight: bold;
  font-size: 18px;
  line-height: ${({ theme }) => theme.FSG_SPACING.S28};

  white-space: pre;

  &:hover {
    color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
    background-color: #87070e;
  }
  &:focus {
    color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  }
  @font-face {
    font-family: 'Poppins';
    src: local('Poppins'), local('Poppins'), url(${PoppinsFont2}) format('woff2'), url(${PoppinsFont}) format('woff');
    font-weight: 700;
    font-style: bold;
  }
`;

export const SingpassLogo = styled.img`
  vertical-align: middle;
`;

export const SingpassPlaceholder = styled.img``;

export const StyledMockLoginButton = styled(Button)<{ visible: boolean }>`
  ${({ visible }) => !visible && 'display: none;'}
`;
