import { EXCEPTION_ERROR_CODE } from '@filesg/common';
import {
  Bold,
  Color,
  FSG_DEVICES,
  Icon,
  IconFileTypeLiterals,
  IconLiterals,
  RESPONSIVE_VARIANT,
  TextLink,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Tab } from '../../../../../components/navigation/tabs/components/tab';
import { WebPage } from '../../../../../consts';
import { WOGAA_TRACKING_ID } from '../../../../../consts/analytics';
import { QrScannerError, useQrScanner } from '../../../../../hooks/common/useQrCodeScanner';
import { useVerifyFileDownload } from '../../../../../hooks/queries/useVerifyFileDownload';
import { isFileSGErrorType, trackWogaaTransaction } from '../../../../../utils/common';
import { VerificationOption } from '../..';
import { OA_SECTION_ID } from '../oa-faq-section';
import { FileUpload } from './components/file-upload';
import { StyledAlert } from './components/file-upload/style';
import { QrScannerModal } from './components/qr-scanner-modal';
import VerifiableFiles from './components/verifiable-files';
import { StyledDropzone, StyledHeader, StyledOaIntroWrapper, StyledTabs, StyledTabTitleLabel, StyledTextButton } from './style';

const TEST_IDS = {
  VERIFICATION_OPTIONS_TITLE: 'verification-options-title',
};
interface Props {
  setOaBlob: Dispatch<SetStateAction<Blob | undefined>>;
  setVerificationOption: React.Dispatch<React.SetStateAction<VerificationOption>>;
}

const VERIFICATION_TOGGLE_HEADER = 'Here are two ways to verify OA files';

const SCAN_QR_CODE_LABEL = 'Scan QR Code';
const SCAN_QR_CODE_LABEL_MOBILE = 'Scan QR';
const UPLOAD_OA_FILE_LABEL = 'Upload OA File';
const UPLOAD_OA_FILE_LABEL_MOBILE = 'Upload OA';

const VERIFICATION_OPTIONS_ID = 'verification-options';

function VerificationOptions({ setOaBlob, setVerificationOption }: Props) {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const navigate = useNavigate();
  const [scanQrError, setScanQrError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [qrToken, setQrToken] = useState('');
  const { data, error, isLoading } = useVerifyFileDownload(qrToken);
  const [isScanning, setIsScanning] = useState(false);

  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);

  useEffect(() => {
    if (data) {
      setOaBlob(data.blob);
    }
  }, [data, setOaBlob]);

  useEffect(() => {
    if (error) {
      const isExpiredCode = isFileSGErrorType(error, EXCEPTION_ERROR_CODE.JWT_EXPIRED);

      switch (true) {
        case isExpiredCode:
          setScanQrError('Expired QR code.');
          break;

        case !!error:
          setScanQrError('Invalid QR code detected in the uploaded image. Please try again.');
          break;

        default:
          setScanQrError('Invalid QR code detected in the uploaded image. Please try again.');
      }
    }
  }, [error]);

  const tabTitle = (label: string, icon: IconLiterals | IconFileTypeLiterals) => {
    return (
      <StyledTabTitleLabel>
        <Typography variant={isSmallerThanNormalTabletPortrait ? 'BODY' : 'PARAGRAPH'}>{label}</Typography>
        <Icon icon={icon} size="ICON_NORMAL" />
      </StyledTabTitleLabel>
    );
  };

  const pageIntroduction = (
    <StyledOaIntroWrapper>
      <Typography variant="PARAGRAPH">
        Government agencies may issue certain documents in the <Bold type="FULL">OpenAttestation file format (.oa)</Bold>. The validity of
        documents issued in the OA format can be verified in real-time.{' '}
      </Typography>
      <TextLink font="PARAGRAPH" type="LINK" to={`${WebPage.VERIFY}#${OA_SECTION_ID}`} replace={true}>
        Learn more about OA
      </TextLink>
    </StyledOaIntroWrapper>
  );

  const uploadQrCodeOnchangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 1) {
      setIsScanning(true);
      scanImage(e.target.files[0])
        .then((result) => {
          setQrToken(result);
        })
        .catch((err) => {
          switch (err) {
            case QrScannerError.UNSUPPORTED_IMAGE_TYPE:
              setScanQrError('The uploaded file format is invalid. Please try again.');
              break;
            case QrScannerError.NO_QR_CODE_FOUND:
              setScanQrError('Failed to detect QR code in the uploaded image. Please try again.');

              break;
            default:
              setScanQrError('Invalid QR code detected in the uploaded image. Please try again.');
          }
        })
        .finally(() => setIsScanning(false));
    }
  };

  const hanldeOnUploadQRImageClick = () => {
    trackWogaaTransaction('START', WOGAA_TRACKING_ID.VERIFY_VIA_UPLOAD_QR_IMAGE);
    setScanQrError('');
    setQrToken('');
    inputRef.current?.click();
  };

  const { scanImage } = useQrScanner({ scanImageOnly: true });

  return (
    <>
      {pageIntroduction}
      <StyledHeader data-testid={TEST_IDS.VERIFICATION_OPTIONS_TITLE} id={VERIFICATION_OPTIONS_ID}>
        <Typography variant={isSmallerThanNormalTabletPortrait ? 'H3_MOBILE' : 'H3'} bold="FULL">
          {VERIFICATION_TOGGLE_HEADER}
        </Typography>
      </StyledHeader>
      <StyledTabs
        tabsName="verification-options"
        onTitleClickHandler={() => {
          navigate(`${WebPage.VERIFY}#${VERIFICATION_OPTIONS_ID}`, { replace: true });
        }}
        onTabClick={(name) => setVerificationOption(name as VerificationOption)}
      >
        <Tab
          testName={VerificationOption.QR_SCAN}
          title={tabTitle(isSmallerThanNormalTabletPortrait ? SCAN_QR_CODE_LABEL_MOBILE : SCAN_QR_CODE_LABEL, 'fsg-icon-scan-qr')}
          ariaLabel="Verify option 1 Scan QR Code on OA document"
        >
          {scanQrError && <StyledAlert variant="DANGER">{scanQrError}</StyledAlert>}
          <StyledDropzone
            isLoading={isScanning || isLoading}
            buttonLabel="Click to scan"
            buttonAriaLabel="Click to scan with device camera"
            onButtonClick={() => {
              trackWogaaTransaction('START', WOGAA_TRACKING_ID.VERIFY_VIA_QR);
              setShowScannerModal((prev) => !prev);
            }}
            description={
              <>
                Please <Bold type="FULL">‘Allow’</Bold> file.gov.sg to access your device camera.
                <br />
                Alternatively, you may{' '}
                <StyledTextButton
                  color={Color.PURPLE_DEFAULT}
                  label={'upload an image of the QR code.'}
                  onClick={hanldeOnUploadQRImageClick}
                  data-testid={'upload-qrcode-image'}
                  disabled={isScanning || isLoading}
                  isEllipsis={false}
                />
              </>
            }
            dropzoneOptions={{
              disabled: true,
            }}
          />

          <input multiple={false} type={'file'} ref={inputRef} hidden={true} accept={'image/*'} onChange={uploadQrCodeOnchangeHandler} />
        </Tab>
        <Tab
          testName={VerificationOption.FILE_UPLOAD}
          title={tabTitle(isSmallerThanNormalTabletPortrait ? UPLOAD_OA_FILE_LABEL_MOBILE : UPLOAD_OA_FILE_LABEL, 'sgds-icon-upload')}
          ariaLabel="Verify option 2 Upload OA File"
        >
          <FileUpload setOaBlob={setOaBlob} />
        </Tab>
      </StyledTabs>
      <VerifiableFiles />

      {showScannerModal && (
        <QrScannerModal
          onModalClose={() => setShowScannerModal(false)}
          setOaBlob={setOaBlob}
          onUploadImageClick={hanldeOnUploadQRImageClick}
        />
      )}
    </>
  );
}

export default VerificationOptions;
