import { ReactElement, useState } from 'react';

import { useShouldRender } from '../../../hooks/useShouldRender';
import { Color } from '../../../styles/color';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Bold } from '../bold';
import { Icon } from '../icon';
import { Typography } from '../typography';
import {
  StyledButton,
  StyledContainer,
  StyledIdentificationMethod,
  StyledIdentificationMethodContent,
  StyledIdentificationMethodsContainer,
  StyledRotatingIcon,
  StyledUnderlinedTypography,
  StyledWrapper,
} from './style';

export type Props = FileSGProps;

const GOV_SG_LINK_LABEL = 'A Singapore Government Agency Website';
const GOV_SG_TRUSTED_SITES = 'https://www.gov.sg/trusted-sites#govsites';
const GOV_SITES_IDENTIFICATION_BUTTON_LABEL = 'How to identify';

type IdentificationMethodProps = {
  icon: ReactElement;
  title: string;
  content: ReactElement;
};

// SVG code is copied from SGDS masthead
const OFFICIAL_WEBSITE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path
      d="M0.166016 5.6665V9.00067H0.999349V13.9998H0.166016V16.4998H0.999349H3.49935H5.16602H7.66601H9.33268H11.8327H13.4993L15.9993 16.5007V16.4998H16.8327V13.9998H15.9993V9.00067H16.8327V5.6665L8.49935 0.666504L0.166016 5.6665ZM3.49935 13.9998V9.00067H5.16602V13.9998H3.49935ZM7.66601 13.9998V9.00067H9.33268V13.9998H7.66601ZM13.4993 13.9998H11.8327V9.00067H13.4993V13.9998ZM10.166 5.6665C10.166 6.58651 9.41935 7.33317 8.49935 7.33317C7.57935 7.33317 6.83268 6.58651 6.83268 5.6665C6.83268 4.7465 7.57935 3.99984 8.49935 3.99984C9.41935 3.99984 10.166 4.7465 10.166 5.6665Z"
      fill="#242425"
    ></path>
  </svg>
);
const SECURE_WEBSITE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="18" viewBox="0 0 15 18" fill="none">
    <path
      d="M14.1663 9.00008C14.1663 8.08091 13.4188 7.33342 12.4997 7.33342H11.6663V4.83342C11.6663 2.53591 9.79717 0.666748 7.49967 0.666748C5.20217 0.666748 3.33301 2.53591 3.33301 4.83342V7.33342H2.49967C1.58051 7.33342 0.833008 8.08091 0.833008 9.00008V15.6667C0.833008 16.5859 1.58051 17.3334 2.49967 17.3334H12.4997C13.4188 17.3334 14.1663 16.5859 14.1663 15.6667V9.00008ZM4.99967 4.83342C4.99967 3.45508 6.12134 2.33341 7.49967 2.33341C8.87801 2.33341 9.99967 3.45508 9.99967 4.83342V7.33342H4.99967V4.83342Z"
      fill="#242425"
    ></path>
  </svg>
);

const IDENTIFICATION_METHODS: Array<IdentificationMethodProps> = [
  {
    title: 'Official website links end with .gov.sg',
    icon: OFFICIAL_WEBSITE_SVG,
    content: (
      <>
        Government agencies communicate via .gov.sg websites (e.g. go.gov.sg/open).{' '}
        <a
          data-testid={TEST_IDS.MASTHEAD_LINK}
          href={GOV_SG_TRUSTED_SITES}
          target={'_blank'}
          rel="noreferrer"
          aria-label="A Singapore Government Agency Website, go to gov.sg"
        >
          Trusted websites <Icon icon="sgds-icon-external" size="ICON_MINI" />
        </a>
      </>
    ),
  },
  {
    title: 'Secure websites use HTTPS',
    icon: SECURE_WEBSITE_SVG,
    content: (
      <>
        Look for a <Bold type="FULL">lock ({SECURE_WEBSITE_SVG})</Bold> or https:// as an added precaution. Share sensitive information only
        on official, secure websites.
      </>
    ),
  },
];

/**
 * Masthead is a component used to inform user that this application is a government website
 */
export const Masthead = ({ className, ...rest }: Props) => {
  const isSmallerThanMobile = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const [showIdentificationMethod, setShowIdentificationMethod] = useState(false);

  const IdentificationMethod = ({ identificationMethods }: { identificationMethods: Array<IdentificationMethodProps> }) => (
    <StyledIdentificationMethodsContainer data-testid={TEST_IDS.MASTHEAD_IDENTIFICATION_METHODS}>
      {identificationMethods.map((method, index) => (
        <StyledIdentificationMethod key={index}>
          <span>{method.icon}</span>
          <StyledIdentificationMethodContent>
            <Typography variant={isSmallerThanMobile ? 'SMALLER' : 'BODY'} bold="SEMI">
              {method.title}
            </Typography>
            <article>
              <Typography variant={isSmallerThanMobile ? 'SMALLER' : 'BODY'}>{method.content}</Typography>
            </article>
          </StyledIdentificationMethodContent>
        </StyledIdentificationMethod>
      ))}
    </StyledIdentificationMethodsContainer>
  );

  function toggleShowIdentificationMethod() {
    setShowIdentificationMethod((prev) => !prev);
  }

  return (
    <StyledWrapper className={className} data-testid={rest['data-testid'] ?? TEST_IDS.MASTHEAD}>
      <StyledContainer data-testid={TEST_IDS.MASTHEAD_LINK}>
        <Icon icon="sgds-icon-sg-crest" size="ICON_SMALL" data-testid={TEST_IDS.ICON} />
        <Typography variant={isSmallerThanMobile ? 'SMALLER' : 'SMALL'} className={'masthead-custom'} color={Color.GREY80}>
          {GOV_SG_LINK_LABEL}
        </Typography>
        <StyledButton
          onClick={toggleShowIdentificationMethod}
          data-testid={TEST_IDS.MASTHEAD_DROPDOWN_BUTTON}
          aria-expanded={showIdentificationMethod}
        >
          <StyledUnderlinedTypography variant={isSmallerThanMobile ? 'SMALLER' : 'SMALL'} className={'masthead-custom'}>
            {GOV_SITES_IDENTIFICATION_BUTTON_LABEL}
          </StyledUnderlinedTypography>
          <StyledRotatingIcon icon={'sgds-icon-chevron-down'} $rotate={showIdentificationMethod} size={'ICON_MINI'} />
        </StyledButton>
      </StyledContainer>
      {showIdentificationMethod && <IdentificationMethod identificationMethods={IDENTIFICATION_METHODS} />}
    </StyledWrapper>
  );
};
