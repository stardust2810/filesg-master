import { Bold, TextLink, Typography } from '@filesg/design-system';

import { ExternalLink, WebPage } from '../../../../consts';
import { ListContent } from '../../../../typings';
import { PrivacyStatementSection } from '..';

export const privacyStatementIntro = (
  <>
    This Government Agency Privacy Statement (“<Bold type="FULL">Privacy Statement</Bold>”) must be read in conjunction with the{' '}
    <TextLink font="PARAGRAPH" type="LINK" to={WebPage.TERMS_OF_USE}>
      {' '}
      Terms of Use
    </TextLink>
    &nbsp;that accompany the applicable service you are requesting from us (the “<Bold type="FULL">Service</Bold>”).
  </>
);

export const privacyStatementContent: PrivacyStatementSection[] = [
  {
    sectionTitle: 'General',
    content: [
      'This is a Government agency digital service.',
      {
        title: 'Please note that:',
        content: [
          'We may use "cookies", where a small data file is sent to your browser to store and track information about you when you enter our websites. The cookie is used to track information such as the number of users and their frequency of use, profiles of users and their preferred sites. While this cookie can tell us when you enter our sites and which pages you visit, it cannot read data off your hard disk.',

          'You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.',

          'The Service may utilise cookies to facilitate authentication and/or login to the Service. If such cookies are rejected, you might not be able to use the Service.',
        ],
      },
      <>
        Please see the{' '}
        <TextLink font="PARAGRAPH" type="ANCHOR" to={`${WebPage.PRIVACY_STATEMENT}#annex`}>
          Annex
        </TextLink>{' '}
        for any additional terms or information.
      </>,
    ],
  },
  {
    sectionTitle: 'Use of Data',
    content: [
      <>
        We may request or collect certain types of data from you in connection with your access or use of the Service. The data that may be
        requested/collected include those identified in the{' '}
        <TextLink font="PARAGRAPH" type="ANCHOR" to={`${WebPage.PRIVACY_STATEMENT}#annex`}>
          Annex
        </TextLink>{' '}
        herein. Your data may be stored in our servers, systems or devices, in the servers, systems or devices of our third party service
        providers or collaborators, or on your device, and may be used by us or our third party service providers or collaborators to
        facilitate your access or use of the Service. We or our third party service providers or collaborators may collect system
        configuration information and/or traffic information (such as an IP address) and/or use information or statistical information to
        operate, maintain or improve the Services or the underlying service of the third party service provider or collaborator. For the
        avoidance of doubt, in this Privacy Statement, a reference to a third party service provider or collaborator includes other third
        parties who provide a service or collaborate with our third party service provider or collaborator.
      </>,
      {
        title: 'If you provide us with personal data:',
        content: [
          {
            title: 'We may use, disclose and process the data for any one or more of the following purposes:',
            content: [
              'to assist, process and facilitate your access or use of the Service;',

              'to administer, process and facilitate any transactions or activities by you, whether with us or any other Public Sector Entity or third party service provider or collaborator, and whether for your own benefit, or for the benefit of a third party on whose behalf you are duly authorized to act;',

              'to carry out your instructions or respond to any queries, feedback or complaints provided by (or purported to be provided by) you or on your behalf, or otherwise for the purposes of responding to or dealing with your interactions with us;',

              'to monitor and track your usage of the Service, to conduct research, data analytics, surveys, market studies and similar activities, in order to assist us in understanding your interests, concerns and preferences and improving the Service (including any service of a third party service provider or collaborator) and other services and products provided by Public Sector Entities. For the avoidance of doubt, we may also collect, use, disclose and process such information to create reports and produce statistics regarding your transactions with us and your usage of the Services and other services and products provided by Public Sector Entities for record-keeping and reporting or publication purposes (whether internally or externally);',

              'for the purposes of storing or creating backups of your data (whether for contingency or business continuity purposes or otherwise), whether within or outside Singapore;',

              'to enable us to contact you or communicate with you on any matters relating to your access or use of the Service, including but not limited to the purposes set out above, via email, push notifications or such other forms of communication that we may introduce from time to time depending on the functionality of the Service and/or your device.',
            ],
          },
          'We may share necessary data with other Public Sector Entities, and third party service providers in connection with the Service, so as to provide the Service to you in the most efficient and effective way unless such sharing is prohibited by law.',

          'We will NOT share your personal data with entities which are not Public Sector Entities, except where such sharing is necessary for such entities to assist us in providing the Service to you or for fulfilling any of the purposes herein.',

          'For your convenience, we may also display to you data you had previously supplied us or other Public Sector Entities.  This will speed up the transaction and save you the trouble of repeating previous submissions. Should the data be out-of-date, please supply us the latest data.',
        ],
      },
      'Please note that we may be required to disclose your data by law, including any law governing the use/provision of any service of a third party service provider or collaborator.',

      'You may withdraw your consent to the use and disclosure of your data by us with reasonable notice and subject to any prevailing legal or contractual restrictions; however, doing so may prevent the proper functioning of the Service and may also result in the cessation of the Service to you.',
    ],
  },
  {
    sectionTitle: 'Protection of data',
    content: [
      'To safeguard your personal data, all electronic storage and transmission of personal data is secured with appropriate security technologies.',

      'The Service may contain links to external sites whose data protection and privacy practices may differ from ours.  We are not responsible for the content and privacy practices of these other websites and encourage you to consult the privacy notices of those sites.',
    ],
  },
  {
    sectionTitle: 'Contact information',
    content: [
      {
        title: (
          <>
            Please{' '}
            <TextLink endIcon="sgds-icon-external" font="PARAGRAPH" type="ANCHOR" to={ExternalLink.CONTACT_US} newTab>
              contact us
            </TextLink>
            &nbsp;if you:
          </>
        ),
        content: [
          'have any enquires or feedback on our data protection policies and procedures; or',

          'need more information on or access to data which you have provided to us in the past.',
        ],
      },
    ],
  },
  {
    sectionTitle: 'Definitions',
    content: [
      'In this Privacy Statement, “Public Sector Entities” means the Government (including its ministries, departments and organs of state) and public authorities (such as statutory boards) and “personal data” shall have the same meaning as its definition in the Personal Data Protection Act 2012 (No. 26 of 2012).',
    ],
  },
];

export const privacyStatementAnnex: ListContent[] = [
  {
    title: (
      <Typography variant="H3">
        <Bold type="FULL">Name of Service: </Bold>FileSG
      </Typography>
    ),
    content: [],
  },
  {
    title: 'Types of data requested/collected',
    content: ['Name', 'NRIC / FIN / Passport', 'Date of birth', 'Contact number', 'Email address'],
  },
  {
    content:
      'For clarity, there may be data requested/collected by the Government or public sector agency issuing the digital document. Please refer to their respective privacy statements for more information.',
  },
];
