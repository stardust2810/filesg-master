import QrScanner from 'qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';

// some of the values have fullstop due to how qr-scanner is coded
export enum QrScannerError {
  NO_FLASH_AVAILABLE = 'No flash available',
  NO_QR_CODE_FOUND = 'No QR code found',
  CAMERA_NOT_FOUND = 'Camera not found.',
  UNSUPPORTED_IMAGE_TYPE = 'Unsupported image type.',
  FAILED_EXECUTION = "Scanner error: Failed to execute 'detect' on 'BarcodeDetector': Invalid element or state.",
}

interface UseQrScannerOptions {
  defaultStart?: boolean;
  onDecode?: (result: string) => void;
  onDecodeError?: (error: Error | string) => void;
  // permissionPollingMs?: number; //FIXME: permission
  timeoutMs?: number;
  scanImageOnly?: boolean;
}

/**
 * Initialize QrScanner library
 *
 * Note: Pass in only useCallback wrapped onDecode and onDecodeError only, else defaultStart will not work
 */
export const useQrScanner = (options: UseQrScannerOptions) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isVideoRefLoaded, setIsVideoRefLoaded] = useState(false);
  const [isOverlayRefLoaded, setIsOverlayRefLoaded] = useState(false);

  const qrScanner = useRef<QrScanner | null>();

  const [hasCamera, setHasCamera] = useState<boolean>();
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState<boolean>();

  const [isTimeout, setIsTimeout] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    defaultStart,
    onDecode,
    onDecodeError,
    // permissionPollingMs, //FIXME: permission
    timeoutMs,
    scanImageOnly,
  } = options;

  // ===========================================================================
  // Functions
  // ===========================================================================
  const onDecodeHandler = useCallback(
    (result: QrScanner.ScanResult) => {
      onDecode?.(result.data);
    },
    [onDecode],
  );

  const onDecodeErrorHandler = useCallback(
    (error: Error | string) => {
      onDecodeError?.(error);
    },
    [onDecodeError],
  );

  const initQrScanner = useCallback(() => {
    if (videoRef.current && !qrScanner.current) {
      qrScanner.current = new QrScanner(videoRef.current, onDecodeHandler, {
        returnDetailedScanResult: true,
        onDecodeError: onDecodeErrorHandler,
        highlightScanRegion: true,
        highlightCodeOutline: false,
        overlay: overlayRef.current!,
      });
    }
  }, [onDecodeErrorHandler, onDecodeHandler, overlayRef, videoRef]);

  const destroyQrScanner = useCallback(() => {
    if (qrScanner.current) {
      qrScanner.current.destroy();
      qrScanner.current = null;
    }
  }, []);

  // ===========================================================================
  // Exported functions
  // ===========================================================================
  const startScan = useCallback(async (): Promise<void> => {
    if (videoRef.current && !qrScanner.current) {
      initQrScanner();
    }

    try {
      await qrScanner.current?.start();
      setCameraPermissionDenied(false);

      if (timeoutMs && !isTimeout) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => setIsTimeout(true), timeoutMs);
      }
    } catch (err) {
      if (err === QrScannerError.CAMERA_NOT_FOUND) {
        setCameraPermissionDenied(true);
      }
    }
  }, [initQrScanner, isTimeout, timeoutMs]);

  const stopScan = useCallback((): void => {
    qrScanner.current?.stop();
  }, []);

  /**
   * NOTE: listing of cameras required Camera Permissions from the browser
   */
  const listCameras = useCallback(async (): Promise<QrScanner.Camera[]> => {
    return await QrScanner.listCameras(true);
  }, []);

  const scanImage = useCallback(
    async (input: File): Promise<string | QrScannerError.NO_QR_CODE_FOUND | QrScannerError.UNSUPPORTED_IMAGE_TYPE> => {
      try {
        return (await QrScanner.scanImage(input, { returnDetailedScanResult: true })).data;
      } catch (err) {
        if (err === QrScannerError.UNSUPPORTED_IMAGE_TYPE || err === QrScannerError.FAILED_EXECUTION) {
          throw QrScannerError.UNSUPPORTED_IMAGE_TYPE;
        }

        throw QrScannerError.NO_QR_CODE_FOUND;
      }
    },
    [],
  );

  const resetTimeout = useCallback(() => {
    setIsTimeout(false);
  }, []);

  const onScannerDismount = useCallback(() => {
    destroyQrScanner();
    clearTimeout(scanTimeoutRef.current);

    setIsOverlayRefLoaded(false);
    setIsVideoRefLoaded(false);
  }, [destroyQrScanner]);

  // ===========================================================================
  // Callback refs
  // ===========================================================================
  const videoCallbackRef = useCallback((node: HTMLVideoElement) => {
    videoRef.current = node;

    setIsVideoRefLoaded(true);
  }, []);

  const overlayCallbackRef = useCallback((node: HTMLDivElement) => {
    overlayRef.current = node;

    setIsOverlayRefLoaded(true);
  }, []);

  // ===========================================================================
  // Start scan on mount if defaultStart
  // ===========================================================================
  useEffect(() => {
    if (defaultStart && isVideoRefLoaded && isOverlayRefLoaded) {
      startScan();
    }
  }, [defaultStart, isOverlayRefLoaded, isVideoRefLoaded, startScan]);

  // ===========================================================================
  // Destroying QrScanner instance & clearTimeout on unmount
  // ===========================================================================
  useEffect(() => {
    return () => {
      destroyQrScanner();
      clearTimeout(scanTimeoutRef.current);
    };
  }, [onScannerDismount, destroyQrScanner]);

  // ===========================================================================
  // Check for camera useEffect
  // ===========================================================================
  useEffect(() => {
    // this check is to prevent unnecessary usage to checking camera availability
    if (scanImageOnly) {
      const checkForCamera = async () => {
        setHasCamera(await QrScanner.hasCamera());
      };

      checkForCamera();
    }
  }, [scanImageOnly]);

  // ===========================================================================
  // Polling for camera permission
  // ===========================================================================
  /**
   * FIXME: Unable to check permission when device's permission for chrome to access camera is denied;
   * Camere label will still reflect actual device label e.g. 'Facetime HD Camera' instead of Default Camera when browser blocks permission for site
   *
   * May need to wait for Permission API support: https://developer.mozilla.org/en-US/docs/Web/API/Permissions
   *
   * Polling permission state instead of using event listener because FireFox & Safari support for Permissions API is non-existant, caa 16 Aug 22
   * https://developer.mozilla.org/en-US/docs/Web/API/Permissions
   */

  return {
    qrScannerRef: qrScanner,
    hasCamera,
    cameraPermissionDenied,
    startScan,
    stopScan,
    listCameras,
    scanImage,
    destroyQrScanner,
    videoRef: videoCallbackRef,
    overlayRef: overlayCallbackRef,
    isTimeout,
    resetTimeout,
    onScannerDismount,
  };
};
