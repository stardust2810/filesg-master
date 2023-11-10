import { Skeleton } from '@filesg/design-system';

import { UserDetailsFormSkeleton } from '../../../../../../../components/inputs/user-details-form/components/skeleton-loader';
import { StyledBodyContainer } from '../../style';

export function SignupFormSkeleton() {
  return (
    <StyledBodyContainer>
      <Skeleton variant="TEXT" textVariant="H1" width={282} />

      <Skeleton variant="RECTANGLE" height={82} width={674} />

      <UserDetailsFormSkeleton />

      <Skeleton variant="RECTANGLE" height={160} width={674} />
    </StyledBodyContainer>
  );
}
