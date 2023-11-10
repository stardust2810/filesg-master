import { Color, FSG_DEVICES, Icon, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';

import { StyledAnimatedLoaderIcon } from '../document-verification-result/style';
import { Container, IconWrapper } from './style';

export const VERIFICATION_RESULT_MESSAGE = 'verification-result-message';

interface Props {
  isSuccess?: boolean;
  status: 'VERIFYING' | 'SUCCESS' | 'FAILURE';
  text: string;
}

export const VerificationResultMessage = ({ status, text }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const getIcon = (status) => {
    switch (status) {
      case 'VERIFYING':
        return (
          <StyledAnimatedLoaderIcon
            size={isSmallerThanSmallTablet ? 'ICON_SMALL' : 'ICON_NORMAL'}
            icon="fsg-icon-loading-solid"
            color={Color.GREY80}
          />
        );

      case 'SUCCESS':
        return (
          <Icon
            icon={'fsg-icon-circle-check'}
            size={isSmallerThanSmallTablet ? 'ICON_SMALL' : 'ICON_NORMAL'}
            color={Color.GREEN_DEFAULT}
            data-testid={`${VERIFICATION_RESULT_MESSAGE}-icon`}
          />
        );
      case 'FAILURE':
        return (
          <Icon
            icon={'fsg-icon-circle-cross'}
            size={isSmallerThanSmallTablet ? 'ICON_SMALL' : 'ICON_NORMAL'}
            color={Color.RED_DEFAULT}
            data-testid={`${VERIFICATION_RESULT_MESSAGE}-icon`}
          />
        );
    }
  };

  return (
    <Container data-testid={`${VERIFICATION_RESULT_MESSAGE}-container`}>
      <IconWrapper>{getIcon(status)}</IconWrapper>
      <Typography variant={isSmallerThanSmallTablet ? 'SMALL' : 'BODY'} data-testid={`${VERIFICATION_RESULT_MESSAGE}`}>
        {text}
      </Typography>
    </Container>
  );
};
