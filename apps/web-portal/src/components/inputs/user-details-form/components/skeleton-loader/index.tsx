import { Skeleton } from '@filesg/design-system';

import { VerifyFormSkeleton } from '../../../verify-form/form-skeleton';
import { StyledDetailsContainer, StyledFieldContainer, StyledFieldsContainer, StyledHeaderContainer } from '../../style';
import { StyledIconTextContainer } from './style';

export function UserDetailsFormSkeleton() {
  return (
    <>
      <StyledDetailsContainer>
        <StyledIconTextContainer>
          <Skeleton variant="RECTANGLE" height={24} width={24} />
          <Skeleton variant="TEXT" textVariant="PARAGRAPH" width={182} />
        </StyledIconTextContainer>

        <StyledFieldsContainer>
          <StyledFieldContainer>
            <Skeleton variant="TEXT" textVariant="BODY" width={48} />
            <Skeleton variant="TEXT" textVariant="BODY" width={145} />
          </StyledFieldContainer>
          <StyledFieldContainer>
            <Skeleton variant="TEXT" textVariant="BODY" width={48} />
            <Skeleton variant="TEXT" textVariant="BODY" width={145} />
          </StyledFieldContainer>
        </StyledFieldsContainer>
      </StyledDetailsContainer>

      <div />

      <StyledDetailsContainer>
        <StyledHeaderContainer>
          <StyledIconTextContainer>
            <Skeleton variant="RECTANGLE" height={24} width={24} />
            <Skeleton variant="TEXT" textVariant="PARAGRAPH" width={182} />
          </StyledIconTextContainer>
          <Skeleton variant="TEXT" textVariant="BODY" width={448} />
        </StyledHeaderContainer>

        <StyledFieldsContainer>
          <VerifyFormSkeleton />
          <VerifyFormSkeleton />
        </StyledFieldsContainer>
      </StyledDetailsContainer>
    </>
  );
}
