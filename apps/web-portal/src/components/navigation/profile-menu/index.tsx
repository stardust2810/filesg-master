import { Color, IListItem, SubMenuList, Typography } from '@filesg/design-system';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import { useAppSelector } from '../../../hooks/common/useSlice';
import { AccessDetailsModal } from '../../../pages/app/profile/components/access-details-modal';
import {
  selectAccessibleAgencies,
  selectCorporateName,
  selectCorporateUen,
  selectIsCorporateUser,
  selectUserLastLoginAt,
  selectUserMaskedUin,
  selectUserName,
} from '../../../store/slices/session';
import { StyleProps } from '../../../typings';
import { getLastLoginMessage, getTimeZone } from '../../../utils/common';
import { StyledContentWrapper, StyledMenu, StyledMenuContent, StyledTextButton, StyledUserProfile } from './style';

type Props = {
  onClose: () => void;
  btnAnchorEl?: HTMLElement;
  items: IListItem[];
} & StyleProps;

const FIRST_LOGIN_MESSAGE = 'This is your first login';
const BUSINESS_ACCOUNT = 'Business Account';
const VIEW_ACCESS = 'View your access';

export const ProfileMenu = ({ btnAnchorEl, onClose, items }: Props) => {
  const [showAccessModal, setShowAccessModal] = useState(false);

  const userName = useAppSelector(selectUserName);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const corporateUen = useSelector(selectCorporateUen);
  const corporateName = useAppSelector(selectCorporateName);
  const userMaskedUin = useAppSelector(selectUserMaskedUin);
  const lastLoginAt = useAppSelector(selectUserLastLoginAt);
  const accessibleAgencies = useAppSelector(selectAccessibleAgencies);
  const theme = useTheme();

  const onAccessButtonClick = () => setShowAccessModal(true);
  const onAccessButtonClose = () => setShowAccessModal(false);

  return (
    <StyledMenu
      onClose={onClose}
      onRouteChange={onClose}
      anchorEl={btnAnchorEl}
      anchorPadding={{ vertical: 19 }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {isCorporateUser ? (
        <StyledContentWrapper>
          <Typography variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60}>
            {BUSINESS_ACCOUNT}
          </Typography>
          <Typography variant="BODY" bold="FULL">
            {corporateName || corporateUen}
          </Typography>
          <StyledTextButton
            label={VIEW_ACCESS}
            startIcon="sgds-icon-lock"
            color={Color.PURPLE_DEFAULT}
            variant="SMALLER"
            onClick={onAccessButtonClick}
          />
        </StyledContentWrapper>
      ) : null}
      <StyledUserProfile>
        <Typography variant="BODY" bold="FULL">
          {userName || userMaskedUin}
        </Typography>
        <Typography variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60}>
          {lastLoginAt ? `${getLastLoginMessage(lastLoginAt)} ${getTimeZone()}` : FIRST_LOGIN_MESSAGE}
        </Typography>
      </StyledUserProfile>
      <StyledMenuContent onClick={onClose}>
        <SubMenuList items={items} hasDivider={true} />
      </StyledMenuContent>
      {showAccessModal && accessibleAgencies && (
        <AccessDetailsModal accessibleAgencies={accessibleAgencies} onClose={onAccessButtonClose} />
      )}
    </StyledMenu>
  );
};
