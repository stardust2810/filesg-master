import styled from 'styled-components';

export const StyledVideo = styled.video`
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

/*
 * .scan-region-highlight is styled via its container
 * because we don't want the outline to show up before video is initialized
 *
 * When video is initialized, .scan-region-highlight will be injected by the
 * library
 */
export const StyledVideoContainer = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  height: 100%;

  & .scan-region-highlight {
    outline: rgba(0, 0, 0, 0.5) solid 100vmax;
  }
`;
