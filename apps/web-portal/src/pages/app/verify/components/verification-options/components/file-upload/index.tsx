import { validateSchema } from '@govtechsg/open-attestation';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ErrorCode, FileRejection } from 'react-dropzone';

import { WOGAA_TRACKING_ID } from '../../../../../../../consts/analytics';
import { formatBytes, trackWogaaTransaction } from '../../../../../../../utils/common';
import { StyledAlert, StyledDropzone } from './style';

interface Props {
  setOaBlob: Dispatch<SetStateAction<Blob | undefined>>;
}

const MAX_ALLOWED_UPLOAD_FILE_SIZE_IN_BYTES = 10000000;

enum OAErrorCode {
  INVALID_OA_FILE = 'invalid-oa-file',
  NOT_FSG_OA_FILE = 'not-fsg-oa-file',
}

const FSG_UPLOAD_ERROR_MESSAGE = {
  [ErrorCode.TooManyFiles]: 'You may upload only 1 file at a time.',
  [ErrorCode.FileTooLarge]: `File size cannot exceed ${formatBytes(MAX_ALLOWED_UPLOAD_FILE_SIZE_IN_BYTES, 0)}.`,
  [OAErrorCode.INVALID_OA_FILE]: 'Your file format is invalid.',
};

export const FileUpload = ({ setOaBlob }: Props) => {
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // React dropzone
  // ---------------------------------------------------------------------------
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError('');

      const onLoadHandler = async (reader: FileReader) => {
        try {
          trackWogaaTransaction('START', WOGAA_TRACKING_ID.VERIFY_VIA_UPLOAD);

          const dataInText = reader.result as string;

          // any file that is not parsable (e.g. pdf, jpeg etc.) will fail here
          const parsedContent = JSON.parse(dataInText);

          const isValidOAFileSchema = validateSchema(parsedContent);

          if (!isValidOAFileSchema) {
            throw new Error(OAErrorCode.INVALID_OA_FILE);
          }

          setOaBlob(new Blob([dataInText]));
        } catch (err) {
          return setError(FSG_UPLOAD_ERROR_MESSAGE[OAErrorCode.INVALID_OA_FILE]);
        }
      };

      for (const { errors } of rejectedFiles) {
        const errorCode = errors[0].code;
        setError(FSG_UPLOAD_ERROR_MESSAGE[errorCode]);
        return;
      }

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = async () => await onLoadHandler(reader);
        reader.readAsText(file);
      });
    },
    [setOaBlob],
  );

  /**
   * Some notes:
   * 1. useFsAccessApi set to false to trigger react-dropzone to use fallback input element instead of using
   * showOpenFilePicker as showOpenFilePicker doesnt help to filter extension type in finder.
   * 2. not using accept props from userDropzone as there is no need for extension OR mimetype validation
   * for our use case because we will be relying on content parsing to determine whether it is a valid OA file.
   */
  return (
    <>
      {error && <StyledAlert variant="DANGER">{error}</StyledAlert>}
      <StyledDropzone
        buttonLabel="Select (.oa) file"
        description="or drag file here"
        dropzoneOptions={{
          onDrop,
          noClick: true,
          noKeyboard: true,
          multiple: false,
          maxSize: MAX_ALLOWED_UPLOAD_FILE_SIZE_IN_BYTES,
          useFsAccessApi: false,
        }}
      />
    </>
  );
};
