import { toKebabCase, Typography } from '@filesg/design-system';
import { useTheme } from 'styled-components';

import { StyledIconLabel, StyledParagraphWrapper, StyledPassList, StyledWrapper } from './style';

const TEST_IDS = {
  VERIFIABLE_FILES: 'verifiable-files',
  VERIFIABLE_FILES_DESCRIPTION: 'verifiable-files-description',
  VERIFIABLE_FILE: 'verifiable-file',
};

const VERIFIABLE_FILES_SECTION_DESCRIPTION =
  'The following documents issued in the OA file format by government agencies can now be verified:';

const AGENCY_NAME = 'Immigration & Checkpoints Authority (ICA)';

const LTVP_LABEL = 'Long-Term Visit Pass (LTVP)';
const STP_LABEL = "Student's Pass (STP)";
const DP_LABEL = "Dependant's Pass (DP)";

type PassLiterals = 'LTVP' | 'STP' | 'DP';

const getPassLabel = (passType: PassLiterals) => {
  switch (passType) {
    case 'LTVP':
      return LTVP_LABEL;
    case 'DP':
      return DP_LABEL;
    case 'STP':
      return STP_LABEL;
  }
};

const getPassIcon = (passType: PassLiterals) => {
  switch (passType) {
    case 'LTVP':
      return 'fsg-icon-ltvp-pass';
    case 'DP':
      return 'fsg-icon-dependent-pass';
    case 'STP':
      return 'fsg-icon-student-pass';
  }
};
function VerifiableFiles() {
  const themeContext = useTheme();

  const getPass = (passType: PassLiterals) => (
    <StyledIconLabel
      data-testid={`${TEST_IDS.VERIFIABLE_FILE}-${toKebabCase(passType)}`}
      icon={getPassIcon(passType)}
      iconColor={themeContext.FSG_COLOR.PRIMARY.DEFAULT}
      iconBackgroundColor={themeContext.FSG_COLOR.PRIMARY.LIGHTEST}
      iconSize="ICON_LARGE"
      alignment="CENTER"
      gap={themeContext.FSG_SPACING.S16}
      title={<Typography variant="BODY">{getPassLabel(passType)}</Typography>}
    />
  );

  return (
    <StyledWrapper data-testid={TEST_IDS.VERIFIABLE_FILES}>
      <StyledParagraphWrapper data-testid={TEST_IDS.VERIFIABLE_FILES_DESCRIPTION}>
        <Typography variant="PARAGRAPH">{VERIFIABLE_FILES_SECTION_DESCRIPTION}</Typography>
      </StyledParagraphWrapper>

      <StyledParagraphWrapper>
        <Typography variant="PARAGRAPH" bold="FULL">
          {AGENCY_NAME}
        </Typography>
      </StyledParagraphWrapper>

      <StyledPassList>
        {getPass('LTVP')}
        {getPass('STP')}
        {getPass('DP')}
      </StyledPassList>
    </StyledWrapper>
  );
}

export default VerifiableFiles;
