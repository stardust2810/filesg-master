import { InfoSkeleton } from '../../../../../components/feedback/skeleton-loader/info-skeleton';
import { StyleContactFormSkeletonWrapper } from './style';

interface Props {
  numOfPersonalDetailItems?: number;
  numOfContactFormItems?: number;
}

export const ProfileSkeleton = ({ numOfPersonalDetailItems = 1, numOfContactFormItems = 1 }: Props) => {
  return (
    <>
      <InfoSkeleton
        title={{ width: 108, height: 32 }}
        subTitle={{ width: 180, height: 20 }}
        items={{ length: numOfPersonalDetailItems, label: { width: 80, height: 16 }, value: { width: 180, height: 16 } }}
      />
      <StyleContactFormSkeletonWrapper>
        <InfoSkeleton
          title={{ width: 180, height: 20 }}
          subTitle={{ width: 448, height: 16 }}
          items={{ length: numOfContactFormItems, label: { width: 80, height: 16 }, value: { width: 600, height: 16 } }}
        />
      </StyleContactFormSkeletonWrapper>
    </>
  );
};
