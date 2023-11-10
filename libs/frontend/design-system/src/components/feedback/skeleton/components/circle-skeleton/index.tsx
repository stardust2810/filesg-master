import ContentLoader from 'react-content-loader';

import { SKELETON_BACKGROUND_COLOR, SKELETON_FOREGROUND_COLOR,SKELETON_SPEED } from '../../../../../utils/constants';
export type CircleSkeletonProps = {
  diameter: number;
};
export const CircleSkeleton = ({ diameter }: CircleSkeletonProps) => {
  return (
    <ContentLoader
      speed={SKELETON_SPEED}
      backgroundColor={SKELETON_BACKGROUND_COLOR}
      foregroundColor={SKELETON_FOREGROUND_COLOR}
      style={{ width: `${diameter.toString()}px`, height: `${diameter.toString()}px` }}
    >
      <circle cx={diameter / 2} cy={diameter / 2} r={diameter / 2} />
    </ContentLoader>
  );
};
