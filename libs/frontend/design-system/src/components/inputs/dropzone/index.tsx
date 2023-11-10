import { DropzoneOptions, useDropzone } from 'react-dropzone';

import { Color } from '../../../styles/color';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Typography } from '../../data-display/typography';
import { Button } from '../button';
import { StyledDropZone } from './style';

export type Props = {
  buttonLabel: string;
  buttonAriaLabel?: string;
  description?: React.ReactChild;
  isLoading?: boolean;
  dropzoneOptions?: DropzoneOptions;
  accept?: string;
  onButtonClick?: () => void;
} & FileSGProps;

export const Dropzone = ({
  buttonLabel,
  buttonAriaLabel,
  description,
  isLoading,
  dropzoneOptions,
  accept,
  onButtonClick,
  className,
  ...rest
}: Props) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <StyledDropZone
      {...getRootProps({ isDragActive })}
      className={className}
      data-testid={rest['data-testid'] ?? TEST_IDS.FILE_UPLOAD_DROPZONE}
    >
      <input {...getInputProps()} accept={accept} />
      {isDragActive ? (
        <Typography variant="BODY" color={Color.PURPLE_DEFAULT}>
          Drop file to upload
        </Typography>
      ) : (
        <>
          <Button
            decoration="OUTLINE"
            color="PRIMARY"
            label={buttonLabel}
            aria-label={buttonAriaLabel}
            onClick={() => {
              !dropzoneOptions?.disabled && open();
              onButtonClick?.();
            }}
            isLoading={isLoading}
          />
          {description && (
            <Typography variant="BODY" data-testid={TEST_IDS.FILE_UPLOAD_DROPZONE_DESCRIPTION}>
              {description}
            </Typography>
          )}
        </>
      )}
    </StyledDropZone>
  );
};
