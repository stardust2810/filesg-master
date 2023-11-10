import { SkeletonVariant } from '../../../utils/typings';
import { CircleSkeleton, CircleSkeletonProps } from './components/circle-skeleton';
import { RectangleSkeleton, RectangleSkeletonProps } from './components/rectangle-skeleton';
import { TextSkeleton, TextSkeletonProps } from './components/text-skeleton';

export type Props = { variant?: SkeletonVariant } & (TextSkeletonProps | CircleSkeletonProps | RectangleSkeletonProps);

export const Skeleton = ({ variant, ...rest }: Props) => {
  switch (variant) {
    case 'TEXT':
      return <TextSkeleton {...(rest as TextSkeletonProps)} />;
    case 'CIRCLE':
      return <CircleSkeleton {...(rest as CircleSkeletonProps)} />;
    case 'RECTANGLE':
      return <RectangleSkeleton {...(rest as RectangleSkeletonProps)} />;
    default:
      return <TextSkeleton></TextSkeleton>;
  }
};
