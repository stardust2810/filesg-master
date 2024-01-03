import { FileSGProps } from '@filesg/design-system';

import { FEATURE_TOGGLE, TOGGLABLE_FEATURES } from '../../../consts/features';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { selectFeatures } from '../../../store/slices/features';

interface Props extends FileSGProps {
  feature: TOGGLABLE_FEATURES;
  featureStatus: FEATURE_TOGGLE;
  children: JSX.Element;
}

export function FeatureToggle({ feature, featureStatus, children }: Props) {
  const features = useAppSelector(selectFeatures);
  const shouldDisplayComponent = features[feature] === featureStatus;

  return shouldDisplayComponent ? children : null;
}
