import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';

import { FSGFont } from '../../../../../typings/fsg-theme';
import { SKELETON_BACKGROUND_COLOR, SKELETON_FOREGROUND_COLOR, SKELETON_SPEED } from '../../../../../utils/constants';
import { convertPxFromRemString } from '../../../../../utils/helper';
export type TextSkeletonProps = {
  textVariant?: keyof FSGFont;
  width?: number;
};
export const TextSkeleton = ({ textVariant = 'BODY', width = 100 }: TextSkeletonProps) => {
  const themeContext = useTheme();
  const height = convertPxFromRemString(themeContext.FSG_FONT[textVariant].SIZE);
  const lineHeight = convertPxFromRemString(themeContext.FSG_FONT[textVariant].LINE_HEIGHT);
  return (
    <div style={{ height: lineHeight, display: 'flex', alignItems: 'center' }}>
      <ContentLoader
        speed={SKELETON_SPEED}
        backgroundColor={SKELETON_BACKGROUND_COLOR}
        foregroundColor={SKELETON_FOREGROUND_COLOR}
        style={{ width: width, maxWidth: '100%', height: height }}
      >
        <rect x="0" y="0" width={width} height={height} />
      </ContentLoader>
    </div>
  );
};
