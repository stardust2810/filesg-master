import { Color, TextLink, Typography } from '@filesg/design-system';
import { ReactElement } from 'react';

import fileNotFoundErrorImage from '../../../assets/images/document/document-file-not-found.svg';
import { StyledInfo } from './styles';

const TITLE = 'No matching results';

type Props = {
  to: string;
};

export const NoFilteredResults = ({ to }: Props) => {
  const descriptions: (string | ReactElement)[] = [
    <Typography key="clear-filter-text" variant="BODY">
      Try{' '}
      <TextLink color={Color.PURPLE_DEFAULT} key="clear-filter-button" to={to} replace={true} type={'LINK'}>
        clearing all filters
      </TextLink>
    </Typography>,
  ];

  return <StyledInfo isCentered={true} image={fileNotFoundErrorImage} title={TITLE} descriptions={descriptions} />;
};
