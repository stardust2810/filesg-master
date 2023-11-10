import { useTheme } from 'styled-components';

import { Color } from '../../../styles/color';
import { Typography } from '../../data-display/typography';
import { Col } from '../../layout/col';
import { Row } from '../../layout/row';
import { ColorContainer, StyledBody, StyledColorBody, StyledContainer, StyledHeader } from './style';

export const ColorBlock = () => {
  const fsgTheme = useTheme();

  const colorStyle = Object.keys(fsgTheme.FSG_COLOR).map((style, index) => {
    const colorType = Object.keys(fsgTheme.FSG_COLOR[style]).map((type, index) => {
      return (
        <Col key={`${style}-${type}-${index}`} style={{ flexGrow: 0 }}>
          <StyledColorBody>
            <Typography variant="BODY">
              {type.toLowerCase()} <br /> {fsgTheme.FSG_COLOR[style][type]}
            </Typography>
            <ColorContainer color={fsgTheme.FSG_COLOR[style][type]} />
          </StyledColorBody>
        </Col>
      );
    });
    return (
      <StyledBody key={`${style}-${index}`}>
        <Typography variant="H3" bold={'FULL'}>
          {style.toLowerCase()}
        </Typography>
        <Row isMobile>{colorType}</Row>
      </StyledBody>
    );
  });
  return (
    <StyledContainer>
      <StyledHeader style={{ backgroundColor: Color.PURPLE_LIGHTEST }}>
        <Typography variant="H1" bold="FULL">
          Color Palette
        </Typography>
        <Typography variant="BODY">FileSG Color Palette</Typography>
      </StyledHeader>

      <StyledBody>{colorStyle}</StyledBody>
    </StyledContainer>
  );
};
