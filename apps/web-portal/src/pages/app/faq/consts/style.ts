import styled from 'styled-components';

//Height: auto because the width & height values are inline, causing the image to stretch when max-width is given.
// Providing width & height prevents layout shifting. See: https://www.smashingmagazine.com/2020/03/setting-height-width-images-important-again/
//TODO: move to global, default img attribute?
export const StyledFaqImg = styled.img`
  height: auto;
`;
