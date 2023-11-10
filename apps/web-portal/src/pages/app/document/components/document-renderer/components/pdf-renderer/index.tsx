import '@react-pdf-viewer/print/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';

import { FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { createStore, Plugin, PluginFunctions, SpecialZoomLevel, Viewer, ViewerState, Worker, ZoomEvent } from '@react-pdf-viewer/core';
import { PrintPlugin } from '@react-pdf-viewer/print';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PDFRendererToolbar } from './components/toolbar';
import { StyledViewerWrapper } from './style';

interface Props {
  blob: Blob;
  printPluginInstance: PrintPlugin;
}

interface StoreProps {
  getViewerState?: () => ViewerState;
}

interface ViewerStatePlugin extends Plugin {
  getViewerState: () => ViewerState | undefined;
}

let inactivityTimeout: NodeJS.Timeout | null;
const toolbarInactivityTimeoutMs = 2000;

export function PDFRenderer({ blob, printPluginInstance }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);

  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const [isShowToolbar, setIsShowToolbar] = useState(false);
  const [uint8Array, setUint8Array] = useState<Uint8Array>();
  const [zoomLevel, setZoomLevel] = useState<number>(0);

  // ===========================================================================
  // Hooks
  // ===========================================================================\
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // ===========================================================================
  // React-PDF-Viewer plugins
  // ===========================================================================
  const CustomViewerStatePlugin = (): ViewerStatePlugin => {
    const store = useMemo(() => createStore<StoreProps>({}), []);

    return {
      install: (pluginFunctions: PluginFunctions) => {
        store.update('getViewerState', pluginFunctions.getViewerState);
      },
      getViewerState: () => {
        const getViewerState = store.get('getViewerState');
        return getViewerState && getViewerState();
      },
    };
  };

  const viewerStatePlugin = CustomViewerStatePlugin();
  const { getViewerState } = viewerStatePlugin;

  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;

  // ===========================================================================
  // Handlers
  // ===========================================================================
  function clearInactivityTimeout() {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
  }

  const resetTimer = useCallback(() => {
    clearInactivityTimeout();
    inactivityTimeout = setTimeout(() => setIsShowToolbar(false), toolbarInactivityTimeoutMs);
  }, []);

  const handleMouseActivity = useCallback(() => {
    resetTimer();
    setIsShowToolbar(true);
  }, [resetTimer]);

  const handleToolbarHover = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    clearInactivityTimeout();
    setIsShowToolbar(true);
  };

  const handleZoomScaleLevel = (event: ZoomEvent) => {
    setZoomLevel(event.scale);
  };

  // =============================================================================
  // useEffects
  // =============================================================================
  // Error in dev env when using url: Refused to connect to 'blob:https://www.dev.file.gov.sg/f0c0512d-9005-490a-84ae-02b3a7c1cac9' because it violates the following Content Security Policy directive: "connect-src 'self' https://*.singpass.gov.sg https://mainnet.infura.io https://cloudflare-dns.com https://dns.google".
  // Convert blob to Uint8Array
  useEffect(() => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      setUint8Array(new Uint8Array(arrayBuffer));
    };

    reader.readAsArrayBuffer(blob);
  }, [blob]);

  useEffect(() => {
    if (isDocumentLoaded) {
      const innerPagesNode = document.querySelector<HTMLDivElement>('div.rpv-core__inner-pages');
      if (innerPagesNode) {
        innerPagesNode.addEventListener('scroll', handleMouseActivity);

        return () => innerPagesNode.removeEventListener('scroll', handleMouseActivity);
      }
    }
  }, [handleMouseActivity, isDocumentLoaded]);

  useEffect(() => {
    return () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const viewerState = getViewerState();
    if (viewerState) {
      setZoomLevel(viewerState.scale);
    }
  }, [getViewerState]);

  // ===========================================================================
  // Render
  // ===========================================================================
  return uint8Array ? (
    <Worker workerUrl="/public/pdf.worker.min.js">
      <StyledViewerWrapper ref={viewerRef} onMouseMove={handleMouseActivity} onTouchMove={handleMouseActivity}>
        <PDFRendererToolbar Toolbar={Toolbar} isShowToolbar={isShowToolbar} onMouseMove={handleToolbarHover} zoomLevel={zoomLevel} />

        <Viewer
          fileUrl={uint8Array}
          plugins={[toolbarPluginInstance, printPluginInstance, viewerStatePlugin]}
          defaultScale={isSmallerThanSmallTablet ? SpecialZoomLevel.PageWidth : undefined}
          onDocumentLoad={() => setIsDocumentLoaded(true)}
          onZoom={handleZoomScaleLevel}
        />
      </StyledViewerWrapper>
    </Worker>
  ) : null;
}
