import { FEATURE_TOGGLE, TOGGLABLE_FEATURES } from '../../consts/features';
import { selectFeatures } from '../../store/slices/features';
import { useAppSelector } from './useSlice';

export const useFeature = (feature: TOGGLABLE_FEATURES): boolean => {
  const features = useAppSelector(selectFeatures);
  if (features) {
    return features[feature] === FEATURE_TOGGLE.ENABLED;
  }

  // default turn off feature
  return false;
};
