import { Color, FileSGProps, Icon, toKebabCase } from '@filesg/design-system';
import { Link } from 'react-router-dom';

import FileImg from '../../../../../assets/images/dashboard/home-info-file.svg';
import { StyledCardContent, StyledImg, StyledLink, StyledTag, StyledTypogrpahy } from './style';

const TEST_IDS = {
  INFO_CARD: 'info-card',
  INFO_CARD_TITLE: 'info-card-title',
  INFO_CARD_TAG: 'info-card-tag',
};

export enum InfoCardTheme {
  PURPLE = 'PURPLE',
  CYAN = 'CYAN',
  GREEN = 'GREEN',
  ORANGE = 'ORANGE',
}

const colorScheme = {
  [InfoCardTheme.PURPLE]: {
    background: Color.PURPLE_LIGHTEST,
    color: Color.PURPLE_DARKER,
    border: Color.PURPLE_LIGHTER,
  },
  [InfoCardTheme.CYAN]: {
    background: Color.CYAN_LIGHTEST,
    color: Color.CYAN_DARKER,
    border: Color.CYAN_LIGHTER,
  },
  [InfoCardTheme.GREEN]: {
    background: Color.GREEN_LIGHTEST,
    color: Color.GREEN_DARKER,
    border: Color.GREEN_LIGHTER,
  },
  [InfoCardTheme.ORANGE]: {
    background: Color.ORANGE_LIGHTEST,
    color: Color.ORANGE_DARKER,
    border: Color.ORANGE_LIGHTER,
  },
};
export type Props = {
  title: string;
  link: string;
  cardTheme?: InfoCardTheme;
  image?: string;
  isExternalLink?: boolean;
  tagMessage?: string;
} & FileSGProps;

export const InfoCard = ({
  title,
  tagMessage,
  link,
  isExternalLink = false,
  image = FileImg,
  cardTheme = InfoCardTheme.PURPLE,
  style,
  className,
}: Props) => {
  return (
    <StyledLink
      as={isExternalLink ? 'a' : Link}
      href={isExternalLink ? link : undefined}
      to={link}
      background={colorScheme[cardTheme].background}
      color={colorScheme[cardTheme].color}
      $borderColor={colorScheme[cardTheme].border}
      data-testid={`${TEST_IDS.INFO_CARD}-${toKebabCase(title)}`}
      target={isExternalLink ? '_blank' : undefined}
      style={style}
      className={className}
    >
      <StyledCardContent>
        <StyledTypogrpahy variant="BODY" bold="SEMI" overrideFontFamily="Work Sans" data-testid={TEST_IDS.INFO_CARD_TITLE}>
          {title} {isExternalLink && <Icon icon="sgds-icon-external" size="ICON_MINI" />}
        </StyledTypogrpahy>
        {tagMessage && (
          <StyledTag variant="SMALLER" data-testid={TEST_IDS.INFO_CARD_TAG}>
            {tagMessage}
          </StyledTag>
        )}
      </StyledCardContent>
      <StyledImg src={image}></StyledImg>
    </StyledLink>
  );
};
