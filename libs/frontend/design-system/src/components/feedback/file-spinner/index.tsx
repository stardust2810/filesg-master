import { FileSGProps } from '../../..';
import { useShouldRender } from '../../../hooks/useShouldRender';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileLoader, FileLoaderText } from './style';

export type Props = {
  children?: string;
} & FileSGProps;

export const FileSpinner = ({ children }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  return (
    <FileLoader data-testid={TEST_IDS.FILE_SPINNER}>
      <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="96" cy="96" r="96" fill="white" />
        <g id="loading-file">
          <g id="folder">
            <path
              id="folder-base"
              d="M79.3431 60H55C52.7909 60 51 61.7909 51 64V128C51 130.209 52.7909 132 55 132H137C139.209 132 141 130.209 141 128V70C141 67.7909 139.209 66 137 66H88.6569C87.596 66 86.5786 65.5786 85.8284 64.8284L82.1716 61.1716C81.4214 60.4214 80.404 60 79.3431 60Z"
            />
            <g id="files">
              <rect id="file-3" x="60" y="70" />
              <rect id="file-2" x="58" y="74" />
              <rect id="file-1" x="56" y="78" />
            </g>
            <path
              id="folder-top"
              d="M140.667 82H51.3329C48.9979 82 47.1594 83.9916 47.3456 86.3191L50.7066 128.319C50.8729 130.398 52.6084 132 54.6938 132H137.308C139.394 132 141.129 130.398 141.296 128.319L144.655 86.3189C144.841 83.9915 143.002 82 140.667 82Z"
            />
          </g>
          <path
            id="mask"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M96 0H0V96V192H96H192V96V0H96ZM96 0C149.019 0 192 42.9807 192 96C192 149.019 149.019 192 96 192C42.9807 192 0 149.019 0 96C0 42.9807 42.9807 0 96 0Z"
          />
        </g>
      </svg>
      {children && (
        <FileLoaderText variant={isSmallerThanSmallTablet ? 'H2_MOBILE' : 'H2'} bold="FULL" data-testid={TEST_IDS.FILE_SPINNER_TEXT}>
          {children}
        </FileLoaderText>
      )}
    </FileLoader>
  );
};
