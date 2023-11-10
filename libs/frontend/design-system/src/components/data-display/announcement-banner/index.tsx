import { useTheme } from 'styled-components';

import { TEST_IDS } from '../../../utils/constants';
import { IconButton } from '../../inputs/icon-button';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { StyledDiv, StyledFeatureTagTextContainer, StyledTag, StyledTextColumn } from './styles';

export type BannerType = 'TECHNICAL' | 'FEATURE_TAG';

type TechnicalBannerProps = {
  type: 'TECHNICAL';
  title?: string;
  description: string;
  onClose?: () => void;
};

type FeatureTagBannerProps = {
  type: 'FEATURE_TAG';
  tag: string;
  description: string;
};

export type Props = TechnicalBannerProps | FeatureTagBannerProps;

/**
 * Announcement banner is an organism component used to surface ad hoc announcement to inform user about upcoming events(Example: Maintenance downtime)
 */
export const AnnouncementBanner = (props: Props): JSX.Element => {
  const theme = useTheme();

  const isTechnicalBanner = (props: Props): props is TechnicalBannerProps => {
    const { type } = props;
    return type === 'TECHNICAL';
  };

  const BannerContent = () => {
    if (isTechnicalBanner(props)) {
      const { title, description, onClose } = props;
      return (
        <>
          <Icon icon="sgds-icon-notification" size="ICON_NORMAL" color={theme.FSG_COLOR.PRIMARY.LIGHTER} />
          <StyledTextColumn>
            {title && (
              <Typography variant="BODY" bold="FULL" color={theme.FSG_COLOR.SYSTEM.WHITE} data-testid={TEST_IDS.ANNOUNCEMENT_BANNER_TITLE}>
                {title}
              </Typography>
            )}
            <Typography variant="SMALL" color={theme.FSG_COLOR.SYSTEM.WHITE} data-testid={TEST_IDS.ANNOUNCEMENT_BANNER_DESCRIPTION}>
              {description}
            </Typography>
          </StyledTextColumn>
          {onClose && (
            <IconButton
              icon="sgds-icon-cross"
              size="SMALL"
              iconColor={theme.FSG_COLOR.SYSTEM.WHITE}
              onClick={onClose}
              decoration="GHOST"
              type="button"
              hasRippleAnimation={false}
              disableHoverEffect={true}
              data-testid={TEST_IDS.ANNOUNCEMENT_BANNER_CLOSE_BUTTON}
              aria-label="Close announcement banner"
            />
          )}
        </>
      );
    }

    const { tag, description } = props;
    return (
      <>
        <StyledTag bold="SEMI" children={tag} variant="FILLED" color="PRIMARY" size="LARGE" tagTheme="DARK" />
        <StyledFeatureTagTextContainer>
          <Typography variant="BODY" color={theme.FSG_COLOR.GREYS.GREY90} data-testid={TEST_IDS.ANNOUNCEMENT_BANNER_DESCRIPTION}>
            {description}
          </Typography>
        </StyledFeatureTagTextContainer>
      </>
    );
  };

  return (
    <StyledDiv $type={props.type} data-testid={TEST_IDS.ANNOUNCEMENT_BANNER}>
      <BannerContent />
    </StyledDiv>
  );
};
