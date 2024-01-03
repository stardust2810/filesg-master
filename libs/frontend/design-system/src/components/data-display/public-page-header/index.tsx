import { useShouldRender } from '../../../hooks/useShouldRender';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Typography } from '../typography';
import { StyledContainer, StyledImageContainer, StyledImg, StyledPageDescriptorsContainer, StyledPublicPageHeader } from './style';

export type Props = {
  /**
   * Title of page
   */
  title: string;
  /**
   * Description of page
   */
  description?: string;
  /**
   * Path of illustration used in this component
   */
  image?: string;
  /**
   * Alt text of the image
   */
  imageAlt?: string;
} & FileSGProps;

/**
 * Public Page Descriptor is a molecule component that display title and description of a public facing page (Pages that does not require authentication).
 */
export const PublicPageDescriptor = ({ title, description, image, imageAlt, ...rest }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  const isSmallerThanTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  return (
    <StyledPublicPageHeader data-testid={TEST_IDS.PUBLIC_PAGE_HEADER} {...rest}>
      <StyledContainer>
        <StyledPageDescriptorsContainer column={isSmallerThanTabletLandscape ? 12 : 8} $hasImage={!!image}>
          <Typography data-testid={TEST_IDS.PUBLIC_PAGE_HEADER_TITLE} variant={isSmallerThanSmallTablet ? 'H1_MOBILE' : 'H1'} bold="FULL">
            {title}
          </Typography>
          {description && (
            <Typography data-testid={TEST_IDS.PUBLIC_PAGE_HEADER_DESCRIPTION} variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>
              {description}
            </Typography>
          )}
        </StyledPageDescriptorsContainer>

        {image && (
          <StyledImageContainer column={isSmallerThanTabletLandscape ? 12 : 4}>
            <StyledImg
              width={277}
              height={164}
              alt={imageAlt ? imageAlt : ''}
              src={image}
              data-testid={TEST_IDS.PUBLIC_PAGE_HEADER_IMAGE}
            />
          </StyledImageContainer>
        )}
      </StyledContainer>
    </StyledPublicPageHeader>
  );
};
