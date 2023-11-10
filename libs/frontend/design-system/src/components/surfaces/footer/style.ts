import styled from 'styled-components';

import { addGapBetweenChildren } from '../../../styles/helper';
import { Typography } from '../../data-display/typography';
import { Props } from '.';

type FooterStylingProps = Pick<Props, 'footerBackgrdColor'>;

export const StyledFooter = styled.footer<FooterStylingProps>`
  width: 100%;
  display: flex;
  flex-direction: column;

  > * :focus {
    outline: solid 2px ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTER};
  }

  background-color: ${({ footerBackgrdColor }) => {
    return footerBackgrdColor;
  }};

  padding: ${({ theme }) => {
    const { S32, S48 } = theme.FSG_SPACING;
    return S32 + ' ' + S48;
  }};

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) and (min-width: calc(${({
      theme,
    }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) {
    padding: ${({ theme }) => {
      const { S24, S32 } = theme.FSG_SPACING;
      return S32 + ' ' + S24;
    }};
  }

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S32 } = theme.FSG_SPACING;
      return S32 + ' ' + S16;
    }};
  }
`;

export const StyledAppDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 640px;

  ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
`;

export const ContactUsLinks = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};

  ${({ theme }) => addGapBetweenChildren('HORIZONTAL', theme.FSG_SPACING.S32)}

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;
    justify-content: flex-start;

    margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
    ${addGapBetweenChildren('HORIZONTAL', '0')}
    ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
  }
`;

export const SitemapLinks = styled.ul`
  display: flex;
  flex-direction: column;

  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};

  ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
`;

export const MandatoryLinks = styled.ul`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};

  ${({ theme }) => addGapBetweenChildren('HORIZONTAL', theme.FSG_SPACING.S32)}

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;

    margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
    ${addGapBetweenChildren('HORIZONTAL', '0')}
    ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
  }
`;

export const StyledGdsBrandingAndCopyrightContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
  ${({ theme }) => addGapBetweenChildren('HORIZONTAL', theme.FSG_SPACING.S24)}

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;
    align-items: flex-start;

    margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
    margin-right: 0;
    ${addGapBetweenChildren('HORIZONTAL', '0')}
    ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
  }
`;

export const StyledGdsBrandingContainer = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => addGapBetweenChildren('HORIZONTAL', theme.FSG_SPACING.S24)}

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;
    align-items: flex-start;

    margin-right: 0;
    ${({ theme }) => addGapBetweenChildren('VERTICAL', theme.FSG_SPACING.S16)}
  }
`;

export const StyledGdsLogo = styled.img`
  backface-visibility: hidden;

  height: ${({ theme }) => theme.FSG_SPACING.S48};
`;

export const StyledDevelopedByContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledCopyrightAndLastUpdatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    align-items: flex-start;
  }
`;

export const CopyrightAndLastUpdatedText = styled(Typography)`
  display: block;

  text-align: right;

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    text-align: left;
  }
`;
