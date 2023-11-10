import '@react-pdf-viewer/toolbar/lib/styles/index.css';

import { Color, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/toolbar';
import React, { HTMLAttributes } from 'react';

import { BUTTON_TYPE, ToolbarButton } from './components/toolbar-button';
import { StyledPageNavigationContainer, StyledToolbarWrapper, StyledToolsContainer } from './style';

interface Props {
  Toolbar: (props: ToolbarProps) => React.ReactElement;
  isShowToolbar: boolean;
  onMouseMove?: HTMLAttributes<HTMLDivElement>['onMouseOver'];
  zoomLevel: number;
}

export function PDFRendererToolbar({ Toolbar, isShowToolbar, onMouseMove, zoomLevel }: Props) {
  const isFullScreenEnabled =
    document['fullscreenEnabled'] ||
    document['mozFullscreenEnabled'] ||
    document['webkitFullscreenEnabled'] ||
    document['msFullscreenEnabled'];

  const isLargerOrEqualToSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO, FSG_DEVICES.SMALL_DESKTOP);

  return (
    <StyledToolbarWrapper onMouseMoveCapture={onMouseMove}>
      <Toolbar>
        {({ GoToPreviousPage, GoToNextPage, CurrentPageLabel, NumberOfPages, ZoomIn, ZoomOut, EnterFullScreen }: ToolbarSlot) => (
          <StyledToolsContainer isShowToolbar={isShowToolbar}>
            {isLargerOrEqualToSmallDesktop && (
              <StyledPageNavigationContainer>
                <GoToPreviousPage>
                  {({ onClick, isDisabled }) => (
                    <ToolbarButton type={BUTTON_TYPE.PAGE_UP} onClick={onClick} disabled={isDisabled} aria-label="Previous page" />
                  )}
                </GoToPreviousPage>
                <Typography variant="BODY" bold="FULL" color={Color.WHITE}>
                  <CurrentPageLabel /> of <NumberOfPages />
                </Typography>
                <GoToNextPage>
                  {({ onClick, isDisabled }) => (
                    <ToolbarButton type={BUTTON_TYPE.PAGE_DOWN} onClick={onClick} disabled={isDisabled} aria-label="Next page" />
                  )}
                </GoToNextPage>
              </StyledPageNavigationContainer>
            )}
            <ZoomIn>
              {({ onClick }) => (
                <ToolbarButton type={BUTTON_TYPE.ZOOM_IN} onClick={onClick} disabled={zoomLevel >= 10} aria-label="Zoom in" />
              )}
            </ZoomIn>
            <ZoomOut>
              {({ onClick }) => (
                <ToolbarButton type={BUTTON_TYPE.ZOOM_OUT} onClick={onClick} disabled={zoomLevel <= 0.1} aria-label="Zoom out" />
              )}
            </ZoomOut>
            {isLargerOrEqualToSmallDesktop && isFullScreenEnabled && (
              <EnterFullScreen>
                {({ onClick }) => {
                  return <ToolbarButton type={BUTTON_TYPE.FULL_SCREEN} onClick={onClick} aria-label="Full screen" />;
                }}
              </EnterFullScreen>
            )}
          </StyledToolsContainer>
        )}
      </Toolbar>
    </StyledToolbarWrapper>
  );
}
