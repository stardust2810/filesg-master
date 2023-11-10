import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { StyledIconBorder, StyledImg } from './style';

export type Props = {
  /**
   * Size of avatar
   */
  size?: number;
  /**
   * Path of image
   */
  imageUrl: string;
} & Required<Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'alt'>> &
  FileSGProps;

/**
 * Avatar is an atomic component used to represent a user via the use of image
 */
export const Avatar = ({ size = 32, imageUrl, alt, ...rest }: Props): JSX.Element => {
  return (
    <StyledIconBorder size={size} data-testid={rest['data-testid'] ?? TEST_IDS.AVATAR}>
      <StyledImg size={size * 0.75} src={imageUrl} alt={alt} data-testid={TEST_IDS.AVATAR_IMAGE} />
    </StyledIconBorder>
  );
};
