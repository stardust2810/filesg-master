import ContentLoader from 'react-content-loader';

import { SKELETON_BACKGROUND_COLOR, SKELETON_FOREGROUND_COLOR,SKELETON_SPEED } from '../../../../../utils/constants';
export type RectangleSkeletonProps = {
  height?: number;
  width?: number;
  borderRadiusInPx?: number;
};

export const RectangleSkeleton = ({ height = 16, width = 200, borderRadiusInPx = 0 }: RectangleSkeletonProps) => {
  return (
    <ContentLoader
      speed={SKELETON_SPEED}
      backgroundColor={SKELETON_BACKGROUND_COLOR}
      foregroundColor={SKELETON_FOREGROUND_COLOR}
      style={{ width: width, maxWidth: '100%', height: height }}
    >
      <rect x="0" y="0" width={width} height={height} rx={borderRadiusInPx} ry={borderRadiusInPx} />
    </ContentLoader>
  );
};
