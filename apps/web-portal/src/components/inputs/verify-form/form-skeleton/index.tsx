import { Skeleton } from '@filesg/design-system';

import { StyledInputContainer, StyledInputRow, StyledLabelAndFieldContainer } from '../style';

export function VerifyFormSkeleton() {
  return (
    <StyledInputContainer>
      <StyledInputRow>
        <StyledLabelAndFieldContainer>
          <Skeleton variant="TEXT" textVariant="BODY" width={48} />
          <Skeleton variant="TEXT" textVariant="BODY" width={180} />
        </StyledLabelAndFieldContainer>
        <Skeleton variant="RECTANGLE" height={48} width={120} />
      </StyledInputRow>
    </StyledInputContainer>
  );
}
