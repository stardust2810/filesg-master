import { Color, Divider, FSG_DEVICES, IconLabel, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { useState } from 'react';

import { TEST_IDS } from '../../../../../consts';
import { useAppSelector } from '../../../../../hooks/common/useSlice';
import {
  selectAccessibleAgencies,
  selectCorporateName,
  selectCorporateUen,
  selectUserMaskedUin,
  selectUserName,
} from '../../../../../store/slices/session';
import { AccessDetailsModal } from '../access-details-modal';
import { StyledDetailsContainer, StyledFieldContainer, StyledFieldsContainer, StyledSectionContainer, StyledTextButton } from './style';

export const CorporateUserProfile = () => {
  const [showAccessModal, setShowAccessModal] = useState(false);

  const corporateName = useAppSelector(selectCorporateName);
  const corporateUen = useAppSelector(selectCorporateUen);
  const userName = useAppSelector(selectUserName);
  const userMaskedUin = useAppSelector(selectUserMaskedUin);
  const accessibleAgencies = useAppSelector(selectAccessibleAgencies);

  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const onButtonClick = () => {
    setShowAccessModal(true);
  };

  const onClose = () => {
    setShowAccessModal(false);
  };

  return (
    <>
      <StyledSectionContainer>
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} color={Color.GREY80} bold="SEMI" overrideFontFamily="Work Sans">
          Business Profile
        </Typography>

        <StyledDetailsContainer>
          <IconLabel
            icon="fsg-icon-business"
            iconColor={Color.GREY60}
            iconSize="ICON_NORMAL"
            alignment="CENTER"
            gap="0.5rem"
            title={
              <Typography variant="PARAGRAPH" bold="FULL">
                Company Particulars
              </Typography>
            }
          />

          <StyledFieldsContainer>
            {corporateName !== null && (
              <StyledFieldContainer>
                <Typography variant="BODY" bold="FULL">
                  Name
                </Typography>
                <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_CORPORATE_NAME_FIELD}>
                  {corporateName || '-'}
                </Typography>
              </StyledFieldContainer>
            )}

            <StyledFieldContainer>
              <Typography variant="BODY" bold="FULL">
                UEN
              </Typography>
              <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_CORPORATE_UEN_FIELD}>
                {corporateUen}
              </Typography>
            </StyledFieldContainer>
          </StyledFieldsContainer>
        </StyledDetailsContainer>
      </StyledSectionContainer>

      <Divider verticalOffset={24} />

      <StyledSectionContainer>
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} color={Color.GREY80} bold="SEMI" overrideFontFamily="Work Sans">
          My Profile
        </Typography>

        <StyledDetailsContainer>
          <IconLabel
            icon="fsg-icon-personal-particulars"
            iconColor={Color.GREY60}
            iconSize="ICON_NORMAL"
            alignment="CENTER"
            gap="0.5rem"
            title={
              <Typography variant="PARAGRAPH" bold="FULL">
                Personal Particulars
              </Typography>
            }
          />

          <StyledFieldsContainer>
            {userName !== null && (
              <StyledFieldContainer>
                <Typography variant="BODY" bold="FULL">
                  Name
                </Typography>
                <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_NAME_FIELD}>
                  {userName || '-'}
                </Typography>
              </StyledFieldContainer>
            )}

            <StyledFieldContainer>
              <Typography variant="BODY" bold="FULL">
                NRIC/FIN
              </Typography>
              <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_UIN_FIELD}>
                {userMaskedUin}
              </Typography>
            </StyledFieldContainer>
          </StyledFieldsContainer>
        </StyledDetailsContainer>

        <StyledDetailsContainer>
          <IconLabel
            icon="sgds-icon-lock"
            iconColor={Color.GREY60}
            iconSize="ICON_NORMAL"
            alignment="CENTER"
            gap="0.5rem"
            title={
              <Typography variant="PARAGRAPH" bold="FULL">
                Access Permissions
              </Typography>
            }
          />

          <StyledFieldsContainer>
            <StyledFieldContainer>
              <Typography variant="BODY" bold="FULL">
                Corppass Role(s)
              </Typography>
              <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_ACCESS_DETAILS_FILED}>
                {accessibleAgencies && accessibleAgencies.length > 0
                  ? accessibleAgencies.map(({ code }) => code).join(', ')
                  : 'Not Assigned'}
              </Typography>
            </StyledFieldContainer>
          </StyledFieldsContainer>
        </StyledDetailsContainer>
      </StyledSectionContainer>

      <StyledTextButton
        label="View Access Details"
        startIcon="sgds-icon-privacy-alt"
        color={Color.PURPLE_DEFAULT}
        onClick={onButtonClick}
      />
      {showAccessModal && accessibleAgencies && <AccessDetailsModal accessibleAgencies={accessibleAgencies} onClose={onClose} />}
    </>
  );
};
