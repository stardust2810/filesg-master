import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import gdsLogo from '../../../assets/logo/gds-logo.png';
import { Color } from '../../../styles/color';
import { DATE_FORMAT_PATTERNS, TEST_IDS } from '../../../utils/constants';
import { toKebabCase } from '../../../utils/helper';
import { FileSGProps, NavProps } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import {
  ContactUsLinks,
  CopyrightAndLastUpdatedText,
  MandatoryLinks,
  SitemapLinks,
  StyledAppDescriptionContainer,
  StyledCopyrightAndLastUpdatedContainer,
  StyledDevelopedByContainer,
  StyledFooter,
  StyledGdsBrandingAndCopyrightContainer,
  StyledGdsBrandingContainer,
  StyledGdsLogo,
} from './style';

const GDS_BRANDING_AND_COPYRIGHT_FONT_COLOR = Color.GREY40;
const GDS_LOGO_ALT = 'GDS Logo';
const GDS_DEVELOPED_BY = 'Developed by Government Digital Services';
const GDS_DIVISION = 'A Division of Government Technology Agency Singapore';

export type FooterLink = { label: string } & NavProps;

export type Props = {
  footerBackgrdColor?: string;
  title: string;
  description: string;
  topSectionLinks: FooterLink[];
  bottomSectionLinks: FooterLink[];
  sitemapLinks?: FooterLink[];
  updatedDate: Date;
} & FileSGProps;

const FooterItem = ({ link }: { link: FooterLink }) => (
  <li>
    {link.external ? (
      <a
        href={link.to}
        target={link.external ? '_blank' : undefined}
        rel="noreferrer"
        data-testid={TEST_IDS.FOOTER + '-link-' + toKebabCase(link.label)}
      >
        <Typography variant="BODY" color={Color.WHITE}>
          {link.label} {link.external && <Icon icon="sgds-icon-external" color={Color.WHITE} size="ICON_MINI" />}
        </Typography>
      </a>
    ) : (
      <Link
        to={link.to}
        target={link.external ? '_blank' : undefined}
        rel="noreferrer"
        data-testid={TEST_IDS.FOOTER + '-link-' + toKebabCase(link.label)}
      >
        <Typography variant="BODY" color={Color.WHITE}>
          {link.label} {link.external && <Icon icon="sgds-icon-external" color={Color.WHITE} size="ICON_MINI" />}
        </Typography>
      </Link>
    )}
  </li>
);

// changing to anchor will show different modal
const FooterItems = ({ links }: { links: FooterLink[] }) => {
  return (
    <>
      {links.map((link, index) => {
        return <FooterItem link={link} key={link.label + index} />;
      })}
    </>
  );
};

export function Footer({
  title,
  description,
  footerBackgrdColor = Color.BLACK,
  topSectionLinks,
  bottomSectionLinks,
  updatedDate,
  className,
  sitemapLinks,
  ...rest
}: Props) {
  const FooterTopContent = () => (
    <>
      <StyledAppDescriptionContainer>
        <Typography asSpan={true} variant="H4" bold="FULL" color={Color.WHITE}>
          {title}
        </Typography>
        <Typography variant="BODY" color={Color.GREY40}>
          {description}
        </Typography>
      </StyledAppDescriptionContainer>

      {sitemapLinks && sitemapLinks.length > 0 && (
        <SitemapLinks>
          <FooterItems links={sitemapLinks} />
        </SitemapLinks>
      )}
    </>
  );

  const FooterBottomContent = () => (
    <>
      {topSectionLinks && topSectionLinks.length > 0 && (
        <ContactUsLinks>
          <FooterItems links={topSectionLinks} />
        </ContactUsLinks>
      )}

      {bottomSectionLinks && bottomSectionLinks.length > 0 && (
        <MandatoryLinks>
          <FooterItems links={bottomSectionLinks} />
        </MandatoryLinks>
      )}

      <StyledGdsBrandingAndCopyrightContainer>
        <GdsBranding />

        <StyledCopyrightAndLastUpdatedContainer>
          <CopyrightAndLastUpdatedText variant="SMALL" color={GDS_BRANDING_AND_COPYRIGHT_FONT_COLOR}>
            © {updatedDate.getFullYear()} Government of Singapore
          </CopyrightAndLastUpdatedText>
          <CopyrightAndLastUpdatedText variant="SMALL" color={GDS_BRANDING_AND_COPYRIGHT_FONT_COLOR}>
            Last Updated {format(updatedDate, DATE_FORMAT_PATTERNS.DATE)}
          </CopyrightAndLastUpdatedText>
        </StyledCopyrightAndLastUpdatedContainer>
      </StyledGdsBrandingAndCopyrightContainer>
    </>
  );

  const GdsBranding = () => (
    <StyledGdsBrandingContainer>
      <StyledGdsLogo src={gdsLogo} alt={GDS_LOGO_ALT} />
      <StyledDevelopedByContainer>
        <Typography variant="SMALL" color={GDS_BRANDING_AND_COPYRIGHT_FONT_COLOR}>
          {GDS_DEVELOPED_BY}
        </Typography>
        <Typography variant="SMALL" color={GDS_BRANDING_AND_COPYRIGHT_FONT_COLOR}>
          {GDS_DIVISION}
        </Typography>
      </StyledDevelopedByContainer>
    </StyledGdsBrandingContainer>
  );

  return (
    <StyledFooter footerBackgrdColor={footerBackgrdColor} className={className} data-testid={rest['data-testid'] ?? TEST_IDS.FOOTER}>
      <FooterTopContent />
      <FooterBottomContent />
    </StyledFooter>
  );
}
