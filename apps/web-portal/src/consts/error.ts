import serverErrorImage from '../assets/images/common/error/server-error.svg';
import fileDeletedErrorImage from '../assets/images/document/document-file-deleted.svg';
import fileNotFoundErrorImage from '../assets/images/document/document-file-not-found.svg';
import fileNotLoadedErrorImage from '../assets/images/document/document-file-not-loaded.svg';
import filePendingAcknowledgementErrorImage from '../assets/images/document/document-file-pending-acknowledgement.svg';
import filePreviewErrorImage from '../assets/images/document/document-file-preview-error.svg';
// =============================================================================
// Errors
// =============================================================================

export const INFO_NOT_LOADED_ERROR = (entity: string) => ({
  image: serverErrorImage,
  title: `We are unable to load your ${entity}`,
  descriptions: ['The server encountered a temporary error and could not complete your request. Please try again later.'],
});

export const FILE_NOT_LOADED_ERROR = {
  image: fileNotLoadedErrorImage,
  title: "We can't seem to load the file",
  descriptions: ['The server encountered a temporary error and could not complete your request. Please try again later.'],
};

export const FILE_NOT_FOUND_ERROR = {
  image: fileNotFoundErrorImage,
  title: "We can't seem to find the file",
  descriptions: ['Check if this is the correct file.'],
};

export const FILE_PREVIEW_ERROR = {
  image: filePreviewErrorImage,
  title: 'File preview error',
  descriptions: ["We can't seem to preview the file you requested for. Please try again."],
};

export const FILE_PREVIEW_NOT_AVAILABLE_ERROR = {
  image: filePreviewErrorImage,
  title: 'File preview not available',
  descriptions: ['Preview for this file format is not supported.'],
};

export const FILE_DELETED_ERROR = {
  image: fileDeletedErrorImage,
  title: 'File was deleted',
  descriptions: [
    'Please contact the issuing agency, if you think that there has been a mistake.',
    'You may refer to the Activity page for more information.',
  ],
};

export const FILE_PENDING_ACKNOWLEDGEMENT_ERROR = {
  image: filePendingAcknowledgementErrorImage,
  title: 'Acknowledgement required',
  descriptions: [
    'The issuing agency requires your acknowledgement of the Terms and Conditions before downloading this file.',
    'Go to the issuance activity to confirm your acknowledgement.',
  ],
};
