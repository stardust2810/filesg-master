/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { VerificationResult } from '@filesg/common';
import { v2 } from '@govtechsg/open-attestation';
import { screen, within } from '@testing-library/react';

import { renderComponent } from '../../../../../utils/testing/test-utils';
import { DocumentVerificationResult, TEST_IDS, VERIFICATION_RESULT_MESSAGE } from '.';

const mockedIssuers: v2.Issuer[] = [
  {
    id: 'did:ethr:0xABCDEFG1234567',
    name: 'Immigration & Checkpoints Authority',
    revocation: {
      type: v2.RevocationType.RevocationStore,
      location: '0x259D6bb42F1070d8EE5778F1B88eB5D93AB6192f',
    },
    identityProof: {
      type: v2.IdentityProofType.DNSDid,
      location: 'test.ica.gov.sg',
      key: 'did:ethr:0xABCDEFG1234567#controller',
    },
  },
  {
    id: 'did:ethr:0x1234567ABCDEFG',
    name: 'Ministry of Manpower',
    revocation: {
      type: v2.RevocationType.RevocationStore,
      location: '0x259D6bb42F1070d8EE5778F1B88eB5D93AB6192f',
    },
    identityProof: {
      type: v2.IdentityProofType.DNSDid,
      location: 'test.mom.gov.sg',
      key: '0x1234567ABCDEFG#controller',
    },
  },
];

const mockedVerificationResult: VerificationResult = {
  documentIntegrity: false,
  documentStatus: true,
  issuerIdentity: false,
  overall: false,
  revocationType: null,
};

describe('DocumentVerificationResult', () => {
  it('should render only the first issuer (will look into supporting multiple issuers in the future)', async () => {
    renderComponent(
      <DocumentVerificationResult
        isVerifying={false}
        isExpandable={false}
        issuers={mockedIssuers}
        verificationResult={mockedVerificationResult}
      />,
      {},
    );

    const issuerIdentityContainer = await screen.findByTestId(TEST_IDS.ISSUER_IDENTITY_CONTAINER);
    const issuedByText = await within(issuerIdentityContainer).findByText(/Issued by/i);
    const firstIssuerText = await within(issuerIdentityContainer).findByText(
      `${mockedIssuers[0].identityProof!.location!} (${mockedIssuers[0].name})`,
    );

    expect(issuerIdentityContainer.children).toHaveLength(1);
    expect(issuedByText).toBeInTheDocument();
    expect(firstIssuerText).toBeInTheDocument();
  });

  it('should render the correct verfication result messages', async () => {
    renderComponent(
      <DocumentVerificationResult
        isVerifying={false}
        isExpandable={false}
        issuers={mockedIssuers}
        verificationResult={mockedVerificationResult}
      />,
      {},
    );

    const verificationResultMessageContainer = await screen.findByTestId(TEST_IDS.VERIFICATION_INDIVIDUAL_RESULTS_CONTAINER);
    const { children } = verificationResultMessageContainer;

    const documentIntegrityText = await within(children[1] as HTMLElement).findByText(
      VERIFICATION_RESULT_MESSAGE.documentIntegrity.failure,
    );
    const documentStatusText = await within(children[0] as HTMLElement).findByText(VERIFICATION_RESULT_MESSAGE.documentStatus.success);
    const issuerIdentityText = await within(children[2] as HTMLElement).findByText(VERIFICATION_RESULT_MESSAGE.issuerIdentity.failure);

    expect(verificationResultMessageContainer.children).toHaveLength(3);
    expect(documentIntegrityText).toBeInTheDocument();
    expect(documentStatusText).toBeInTheDocument();
    expect(issuerIdentityText).toBeInTheDocument();
  });
});
