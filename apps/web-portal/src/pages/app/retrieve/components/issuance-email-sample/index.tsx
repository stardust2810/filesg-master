import { Color, Icon } from '@filesg/design-system';

import {
  EmailContentContainer,
  EmailLabelContainer,
  StyledFieldContainer,
  StyledRobotoFieldLabel,
  StyledRobotoText,
  StyledSampleWrapper,
} from './style';

const SAMPLE_DATA = [
  {
    label: 'Recipient Name',
    value: 'Joey Chan Hsiao An',
  },
  {
    label: 'Agency Reference No.',
    value: 'XXXXXX-XXXXXX',
  },
  {
    label: 'Transaction ID',
    value: `FSG-20230101-XXXXXXXXXXXXXXXX or \nactivity-XXXXXXXXXXXXX-XXXXXXXXXXXXXXXX`,
    outlineField: true,
  },
];

const IssuanceEmailSample = (): JSX.Element => {
  return (
    <StyledSampleWrapper>
      <EmailLabelContainer>
        <Icon icon="sgds-icon-mail" />
      </EmailLabelContainer>
      <EmailContentContainer aria-label="This is an example which shows that you can find your Transaction ID below Agency Reference Number, in the file issuance email.">
        <StyledRobotoText variant="BODY" bold="FULL">
          Issuance of Document
        </StyledRobotoText>
        {SAMPLE_DATA.map(({ label, value, outlineField }, index) => {
          return (
            <StyledFieldContainer $outlineField={outlineField} key={index}>
              <StyledRobotoFieldLabel>{label}</StyledRobotoFieldLabel>
              <StyledRobotoText variant="SMALL" bold="MEDIUM" color={Color.GREY80}>
                {value}
              </StyledRobotoText>
            </StyledFieldContainer>
          );
        })}
      </EmailContentContainer>
    </StyledSampleWrapper>
  );
};

export default IssuanceEmailSample;
