import { Typography } from '@filesg/design-system';
import React from 'react';

import { InformationModal } from '../../../../../components/feedback/modal/information-modal';

interface Props {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function OAModal({ setIsOpen }: Props) {
  const OAMessage = (
    <>
      <Typography variant="BODY">
        OpenAttestation (OA) is an open-sourced framework to endorse and verify documents.
        <br />
        <br />
        Documents issued this way are cryptographically trustworthy and can be verified independently.
        <br />
        <br />
      </Typography>
      <Typography variant="BODY" bold="FULL">
        .oa file is not meant to be readable but to be shared with the authorities if requested.
      </Typography>
    </>
  );

  return <InformationModal title="What is OA?" information={OAMessage} onClose={() => setIsOpen(false)} />;
}
