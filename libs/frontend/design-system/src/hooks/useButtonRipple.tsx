import React, { useState } from 'react';
import styled from 'styled-components';

import { ColorTheme } from '../components/inputs/button';
import { ButtonDecoration } from '../utils/typings';

interface RippleProps {
  key: number;
  style: React.CSSProperties;
}

const MINIMUM_RIPPLE_SIZE = 100;

// Abstract from https://github.com/robertkirsz/useripple
export function useButtonRipple(color: ColorTheme, decoration: ButtonDecoration) {
  const [ripples, setRipples] = useState<RippleProps[]>([]);

  function createRipple(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const button = event.currentTarget;
    const { left, top } = button.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const diameter = Math.min(button.clientHeight, button.clientWidth, MINIMUM_RIPPLE_SIZE);

    const newRipple: RippleProps = {
      key: event.timeStamp,
      style: {
        width: diameter,
        height: diameter,
        left: x - diameter / 2,
        top: y - diameter / 2,
      },
    };

    setRipples((prev) => [...prev, newRipple]);
  }

  const ripplesArray: JSX.Element[] = ripples.map((ripple) => {
    function handleAnimationEnd() {
      setRipples((state) => state.filter((prev) => prev.key !== ripple.key));
    }

    return <StyledRipple {...ripple} colorTheme={color} decoration={decoration} onAnimationEnd={handleAnimationEnd} />;
  });

  return { createRipple, ripplesArray };
}

const StyledRipple = styled.span<{ decoration: ButtonDecoration; colorTheme: ColorTheme }>`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transform: scale(0);

  animation: ripple 300ms linear;

  background-color: ${({ colorTheme, decoration }) => {
    switch (decoration) {
      case 'SOLID':
        return colorTheme.DEFAULT;

      case 'OUTLINE':
        return colorTheme.LIGHTEST;

      default:
        return colorTheme.DEFAULT;
    }
  }};

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
