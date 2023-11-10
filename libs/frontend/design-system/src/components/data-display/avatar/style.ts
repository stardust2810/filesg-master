import styled from 'styled-components';

import { Color } from '../../../styles/color';
import { Props } from './index';

type StyledProps = Required<Pick<Props, 'size'>>;

export const StyledIconBorder = styled.div<StyledProps>`
  position: relative;
  box-sizing: border-box;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 2px solid ${Color.GREY20};
  border-radius: ${({ size }) => size}px;
  min-width: 32px;
`;

export const StyledImg = styled.img<StyledProps>`
  position: relative;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: ${({ size }) => size * 0.5}px;
  margin: 0 auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
