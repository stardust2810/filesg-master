import { AccessibleAgency } from '@filesg/common';
import { Typography } from '@filesg/design-system';
import React from 'react';

import { InformationModal } from '../../../../../components/feedback/modal/information-modal';
import { WebPage } from '../../../../../consts';
import { StyledContainer, StyledUnorderedList, StypedTextLink } from './style';

interface Props {
  accessibleAgencies: AccessibleAgency[];
  onClose: () => void;
}

export function AccessDetailsModal({ accessibleAgencies, onClose }: Props) {
  const message = (
    <>
      {accessibleAgencies.length > 0 ? (
        <>
          <Typography variant="BODY">
            You can view activities and documents issued to you by the following government agencies based on the Corppass Role(s) you have
            been assigned:
          </Typography>
          <StyledUnorderedList>
            {accessibleAgencies.map(({ code, name }) => (
              <li>
                <Typography variant="BODY" bold="FULL">
                  {code} ({name})
                </Typography>
              </li>
            ))}
          </StyledUnorderedList>
        </>
      ) : (
        <StyledContainer>
          <Typography variant="BODY">
            You do not have permission to view activities and documents issued to you by any government agencies as you have not been
            assigned a Corppass Role(s).
          </Typography>
          <Typography variant="BODY">Please contact your Corppass Admin to assign a Corppass Role to you.</Typography>
        </StyledContainer>
      )}
      <Typography variant="BODY">
        For more details, refer to{' '}
        <StypedTextLink font="BODY" to={`${WebPage.FAQ}${WebPage.RETRIEVING_BUSINESS_DOCUMENTS}`} type="LINK">
          FAQ - Retrieving business documents
        </StypedTextLink>
      </Typography>
    </>
  );

  return <InformationModal title="Your Access Details" information={message} onClose={onClose} />;
}
