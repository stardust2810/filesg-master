import { FAQ_CONTENT_TYPE, FaqAccordionDetails } from '../../faq/consts';
import IssuanceEmailSample from '../components/issuance-email-sample';

export const RETRIEVE_FAQ_OBJECT: FaqAccordionDetails[] = [
  {
    id: 'find-transaction-id',
    title: 'Where can I find the Transaction ID?',
    content: [
      {
        type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
        content:
          'You will receive an email when a government agency issues you document(s) through FileSG. You can find a unique Transaction ID in the email.',
      },
      {
        type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
        content: <IssuanceEmailSample />,
      },
      {
        type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
        content:
          'If you did not receive the issuance email, check with the issuing agency. If you have a Singpass account, you may log in to your FileSG account to access the file instead.',
      },
    ],
  },
  {
    id: 'who-can-retrieve',
    title: 'Who can retrieve my documents?',
    content: [
      {
        type: FAQ_CONTENT_TYPE.CONTENT_ONLY,
        content: [
          'Only document recipients themselves can retrieve their documents via Singpass login.',
          'For individuals without Singpass, please select "Retrieve without Singpass" after you have entered your Transaction ID, and verify your identity via Two-Factor Authentication (2FA) to access your documents.',
        ],
      },
    ],
  },
];
