import { EXCEPTION_ERROR_CODE } from '@filesg/common';
import { Button, Modal, TextLink, Typography } from '@filesg/design-system';
import { Dispatch, forwardRef, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';

import { WebPage } from '../../../../../../../consts';
import { useQrScanner } from '../../../../../../../hooks/common/useQrCodeScanner';
import { useVerifyFileDownload } from '../../../../../../../hooks/queries/useVerifyFileDownload';
import { isFileSGErrorType } from '../../../../../../../utils/common';
import { NoDetectBody } from './components/no-detect';
import { NoPermissionBody } from './components/no-permission';
import { Scanner } from './components/scanner';
import { StyledBody, StyledBodyTextContainer, StyledCard, StyledFooter, StyledModal } from './style';

interface ModalObject {
  title: MODAL_TITLE;
  body: ReactNode;
  footer?: ReactNode;
}

interface Props {
  onModalClose: () => void;
  onUploadImageClick: () => void;
  setOaBlob: Dispatch<SetStateAction<Blob | undefined>>;
}

const NO_CAMERA_BODY = (
  <StyledBodyTextContainer>
    <Typography variant="BODY">
      It seems that there is no camera detected. <br />
      <br />
      You may choose upload an image of the QR code instead.
    </Typography>
  </StyledBodyTextContainer>
);

const EXPIRED_CODE_BODY = (
  <StyledBodyTextContainer>
    <Typography variant="BODY">
      QR codes on OA documents are designed to expire after a period of time due to security considerations. <br />
      <br />
      To continue with verification, you may request for a copy of the document with a valid QR code from the owner. <br />
      <br />
      Document owners may visit{' '}
      <TextLink type="LINK" to={WebPage.ROOT}>
        file.gov.sg
      </TextLink>{' '}
      at any time to obtain a copy of their document with an extended QR expiry date. <br />
      <br />
      Alternatively, you may verify by uploading the OA file instead if it is provided.
    </Typography>
  </StyledBodyTextContainer>
);

const INVALID_CODE_BODY = (
  <StyledBodyTextContainer>
    <Typography variant="BODY">
      Make sure you are scanning the QR code on an OA document that is issued through FileSG.
      <br />
      <br />
      Document owners may visit{' '}
      <TextLink type="LINK" to={WebPage.ROOT}>
        file.gov.sg
      </TextLink>{' '}
      at any time to obtain a copy of their document with a valid QR code.
      <br />
      <br />
      Alternatively, you may verify by uploading the OA file instead if it is provided.
    </Typography>
  </StyledBodyTextContainer>
);

enum MODAL_TITLE {
  SCANNER = 'Scan QR code',
  NO_PERMISSION = 'Allow camera access',
  NO_CAMERA = 'No camera detected',
  INVALID_CODE = 'Invalid QR code',
  EXPIRED_CODE = 'Expired QR code',
  FAILED_DETECT = 'Failed to detect QR code',
}

export const QrScannerModal = forwardRef<HTMLDivElement, Props>(({ onModalClose, setOaBlob, onUploadImageClick }, ref) => {
  const [qrToken, setQrToken] = useState('');

  // ===========================================================================
  // Handlers
  // ===========================================================================
  const onDecode = useCallback((result: string) => {
    setQrToken(result);
  }, []);

  // =============================================================================
  // Hooks
  // =============================================================================
  const { hasCamera, cameraPermissionDenied, overlayRef, videoRef, isTimeout, resetTimeout, onScannerDismount } = useQrScanner({
    defaultStart: true,
    onDecode,
    // permissionPollingMs: 500, FIXME: permission
    timeoutMs: 20 * 1000,
  });

  // ===========================================================================
  // Queries
  // ===========================================================================
  const { data, error, isLoading } = useVerifyFileDownload(qrToken);

  // ===========================================================================
  // useEffects
  // ===========================================================================
  // Set oaBlob if verified
  useEffect(() => {
    if (data) {
      setOaBlob(data.blob);
      onModalClose();
    }
  }, [data, onModalClose, setOaBlob]);

  // ===========================================================================
  // Render
  // ===========================================================================

  const [modalObject, setModalObject] = useState<ModalObject>({
    title: MODAL_TITLE.SCANNER,
    body: <Scanner videoRef={videoRef} overlayRef={overlayRef} onDismountHandler={onScannerDismount} isLoading={isLoading} />,
  });

  useEffect(() => {
    const isExpiredCode = isFileSGErrorType(error, EXCEPTION_ERROR_CODE.JWT_EXPIRED);

    function modalObjectHandler() {
      switch (true) {
        case hasCamera === false: // hasCamera initial state is undefined, only false will indicate no camera
          setModalObject({
            title: MODAL_TITLE.NO_CAMERA,
            body: NO_CAMERA_BODY,
            footer: (
              <Button
                label="Upload image"
                onClick={() => {
                  onModalClose();
                  onUploadImageClick();
                }}
              />
            ),
          });
          break;

        case cameraPermissionDenied:
          setModalObject({
            title: MODAL_TITLE.NO_PERMISSION,
            body: <NoPermissionBody />,
          });
          break;

        case isExpiredCode:
          setModalObject({
            title: MODAL_TITLE.EXPIRED_CODE,
            body: EXPIRED_CODE_BODY,
          });
          break;

        case !!error:
          setModalObject({
            title: MODAL_TITLE.INVALID_CODE,
            body: INVALID_CODE_BODY,
            footer: <Button label="Scan Again" onClick={() => setQrToken('')} />,
          });
          break;

        case isTimeout:
          setModalObject({
            title: MODAL_TITLE.FAILED_DETECT,
            body: <NoDetectBody />,
            footer: <Button label="Scan Again" onClick={resetTimeout} />,
          });
          break;

        default:
          setModalObject({
            title: MODAL_TITLE.SCANNER,
            body: <Scanner videoRef={videoRef} overlayRef={overlayRef} onDismountHandler={onScannerDismount} isLoading={isLoading} />,
          });
      }
    }

    modalObjectHandler();
  }, [
    cameraPermissionDenied,
    error,
    hasCamera,
    isLoading,
    isTimeout,
    onModalClose,
    onUploadImageClick,
    onScannerDismount,
    overlayRef,
    resetTimeout,
    videoRef,
  ]);

  const { title, body, footer } = modalObject;

  return (
    <StyledModal onBackdropClick={onModalClose} ref={ref}>
      <StyledCard>
        <Modal.Header onCloseButtonClick={onModalClose}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <StyledBody>{body}</StyledBody>
        {footer && <StyledFooter>{footer}</StyledFooter>}
      </StyledCard>
    </StyledModal>
  );
});
