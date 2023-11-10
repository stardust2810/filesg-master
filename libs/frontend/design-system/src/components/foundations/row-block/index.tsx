import { Typography } from '../../data-display/typography';
import { Col } from '../../layout/col';
import { Row } from '../../layout/row';
import { StyledBody, StyledCol, StyledColumnsContainer, StyledContainer, StyledHeader, StyledSectionContainer } from './style';

export const RowBlock = () => {
  return (
    <StyledContainer>
      <StyledHeader>
        <Row>
          <Typography variant="H1" bold="FULL">
            Grid System
          </Typography>
        </Row>
        <Typography variant="BODY">Rows & columns to structure your content with a twelve-column system, powered by SGDS Grid.</Typography>
      </StyledHeader>

      <StyledBody>
        <StyledSectionContainer>
          <Row>
            <Typography variant="H2" bold="FULL">
              Default
            </Typography>
          </Row>
          <Row>
            <Typography variant="BODY">
              Row automatically wraps if total columns size exceed 12 (isMultiline by default).
              <br />
              Columns break into rows if viewport goes below mobile breakpoint (768px).
            </Typography>
          </Row>

          <StyledColumnsContainer>
            <Row>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={4}>
                <Typography variant="BODY">Col size: 4</Typography>
              </StyledCol>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={8}>
                <Typography variant="BODY">Col size: 8</Typography>
              </StyledCol>
              <StyledCol column={4}>
                <Typography variant="BODY">Col size: 4</Typography>
              </StyledCol>
            </Row>
          </StyledColumnsContainer>

          <Typography variant="BODY">Columns will adopt equal widths if column size is not specified.</Typography>

          <StyledColumnsContainer>
            <Row>
              <StyledCol>
                <Typography variant="BODY">Col size not specified</Typography>
              </StyledCol>
              <StyledCol>
                <Typography variant="BODY">Col size not specified</Typography>
              </StyledCol>
              <StyledCol>
                <Typography variant="BODY">Col size not specified</Typography>
              </StyledCol>
            </Row>
          </StyledColumnsContainer>
        </StyledSectionContainer>

        <StyledSectionContainer>
          <Row>
            <Typography variant="H2" bold="FULL">
              Nesting
            </Typography>
          </Row>
          <Typography variant="BODY">Rows and columns may be nested.</Typography>
          <StyledColumnsContainer>
            <Row isMobile>
              <Col column={6}>
                <Row isMobile style={{ margin: 0 }}>
                  <StyledCol>
                    <Typography variant="BODY">
                      Col 1 -{'>'} Row -{'>'} Col 1
                    </Typography>
                  </StyledCol>
                  <StyledCol>
                    <Typography variant="BODY">
                      Col 1 -{'>'} Row -{'>'} Col 2
                    </Typography>
                  </StyledCol>
                </Row>
              </Col>
              <Col column={6}>
                <Row isMobile style={{ margin: 0 }}>
                  <StyledCol>
                    <Typography variant="BODY">
                      Col 2 -{'>'} Row -{'>'} Col 1
                    </Typography>
                  </StyledCol>
                  <StyledCol>
                    <Typography variant="BODY">
                      Col 2 -{'>'} Row -{'>'} Col 2
                    </Typography>
                  </StyledCol>
                  <StyledCol>
                    <Typography variant="BODY">
                      Col 2 -{'>'}Row -{'>'} Col 3
                    </Typography>
                  </StyledCol>
                </Row>
              </Col>
            </Row>
          </StyledColumnsContainer>
        </StyledSectionContainer>

        <StyledSectionContainer>
          <Row>
            <Typography variant="H2" bold="FULL">
              Col offset
            </Typography>
          </Row>

          <Typography variant="BODY">Columns may be offset.</Typography>
          <StyledColumnsContainer>
            <Row isMultiline={false}>
              <StyledCol offset={2} column={4}>
                <Typography variant="BODY">Col size: 4 & offset: 2</Typography>
              </StyledCol>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
            </Row>
          </StyledColumnsContainer>
        </StyledSectionContainer>

        <StyledSectionContainer>
          <Row>
            <Typography variant="H2" bold="FULL">
              Row isMultiline
            </Typography>
          </Row>

          <Typography variant="BODY">
            The property "isMultiline" is set to true by default. When set to false, columns continue to align within row beyond column size
            of 12.
          </Typography>
          <StyledColumnsContainer>
            <Row isMultiline={false}>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={4}>
                <Typography variant="BODY">Col size: 4</Typography>
              </StyledCol>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={6}>
                <Typography variant="BODY">Col size: 6</Typography>
              </StyledCol>
            </Row>
          </StyledColumnsContainer>
        </StyledSectionContainer>

        <StyledSectionContainer>
          <Row>
            <Typography variant="H2" bold="FULL">
              Row isMobile
            </Typography>
          </Row>

          <Typography variant="BODY">Column maintains alignment at tablet/mobile breakpoints.</Typography>
          <StyledColumnsContainer>
            <Row isMobile>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={4}>
                <Typography variant="BODY">Col size: 4</Typography>
              </StyledCol>
              <StyledCol column={2}>
                <Typography variant="BODY">Col size: 2</Typography>
              </StyledCol>
              <StyledCol column={6}>
                <Typography variant="BODY">Col size: 6</Typography>
              </StyledCol>
            </Row>
          </StyledColumnsContainer>
        </StyledSectionContainer>
      </StyledBody>
    </StyledContainer>
  );
};
