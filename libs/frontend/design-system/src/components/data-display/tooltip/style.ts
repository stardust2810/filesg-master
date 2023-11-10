import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

const TOOLTIP_WIDTH_IN_MOBILE_IN_PX = 256;
const TOOLTIP_WIDTH_IN_PX = 320;
export const StyledTooltipWrapper = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
`;

export const StyledReactTooltip = styled(ReactTooltip)`
  max-width: ${TOOLTIP_WIDTH_IN_MOBILE_IN_PX / 16}rem;
  word-break: break-word;

  padding: ${({ theme }) => theme.FSG_SPACING.S12};

  &.__react_component_tooltip {
    font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
    font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
    line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};

    border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

    padding: ${({ theme }) => {
      const { S8, S12 } = theme.FSG_SPACING;
      return `${S8} ${S12}`;
    }};
  }

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) {
    max-width: ${TOOLTIP_WIDTH_IN_PX / 16}rem;
  }
`;

//To display the tooltip component neatly in storybook.
export const DisplayDiv = styled.div`
  height: 492px;
  display: flex;
  align-items: center;
`;
