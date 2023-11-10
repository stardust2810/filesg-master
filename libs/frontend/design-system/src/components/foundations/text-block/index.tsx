import { useState } from 'react';
import { useTheme } from 'styled-components';

import { Color } from '../../../styles/color';
import { FSGFont } from '../../../typings/fsg-theme';
import { Typography } from '../../data-display/typography';
import { Button } from '../../inputs/button';
import {
  StyledContainer,
  StyledHeader,
  StyledTypeDetails,
  StyledTypeDetailsContainer,
  StyledTypeDetailsField,
  StyledTypographyContainer,
  StyledTypographyExampleContainer,
  StyledTypographyInfoContainer,
} from './style';

function convertPxFromRemString(rem: string) {
  return parseFloat(rem) * 16;
}
const TypeDetailsField = ({ label, value }: { label: string; value: string }) => (
  <StyledTypeDetailsField>
    <Typography variant="PARAGRAPH" color={Color.GREY60}>
      {label}
    </Typography>
    <Typography variant="PARAGRAPH">{value}</Typography>
  </StyledTypeDetailsField>
);

export const TextBlock = () => {
  const [bold, setBold] = useState<'FULL' | 'SEMI' | 'MEDIUM' | undefined>();
  const fsgTheme = useTheme();

  const fontStyle = Object.keys(fsgTheme.FSG_FONT).map((font, index) => {
    return (
      <StyledTypographyInfoContainer key={`typo-variant-${index}`}>
        <StyledTypeDetailsContainer>
          <Typography variant="H3" bold="FULL">
            {font}
          </Typography>
          <StyledTypeDetails>
            <TypeDetailsField label={'family'} value={fsgTheme.FSG_FONT[font].FONT_FAMILY} />
            <TypeDetailsField
              label={'size'}
              value={`${convertPxFromRemString(fsgTheme.FSG_FONT[font].SIZE)}px / ${fsgTheme.FSG_FONT[font].SIZE}`}
            />
            <TypeDetailsField
              label={'line-height'}
              value={`${convertPxFromRemString(fsgTheme.FSG_FONT[font].SIZE)}px / ${fsgTheme.FSG_FONT[font].SIZE}`}
            />
            <TypeDetailsField label={'when to use'} value={`-`} />
          </StyledTypeDetails>
        </StyledTypeDetailsContainer>
        <StyledTypographyExampleContainer>
          <Typography variant={font as keyof FSGFont} bold={bold}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Typography>
        </StyledTypographyExampleContainer>
      </StyledTypographyInfoContainer>
    );
  });

  return (
    <StyledContainer>
      <StyledHeader>
        <Typography variant="H1" bold="FULL">
          Typography
        </Typography>
        <Typography variant="BODY">List of variants to be used with the Text Component</Typography>

        <Button
          label={'Toggle Bold'}
          onClick={() => {
            return setBold((bold) => {
              if (bold === 'FULL') {
                return undefined;
              }
              return 'FULL';
            });
          }}
          size="NORMAL"
          style={{ width: 200 }}
          color={'SECONDARY'}
        />
      </StyledHeader>
      <StyledTypographyContainer>{fontStyle}</StyledTypographyContainer>
    </StyledContainer>
  );
};
