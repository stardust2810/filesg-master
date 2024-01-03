import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FEATURE_TOGGLE, TOGGLABLE_FEATURES } from '../../consts/features';
import { RootState } from '../store';

type Feature = {
  [feature in TOGGLABLE_FEATURES]: FEATURE_TOGGLE;
};

type FeatureState = Feature | Record<string, never>;

const initialState: FeatureState = {};

export const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setFeatures: (state, action: PayloadAction<Feature>) => {
      Object.assign(state, action.payload);
    },
    resetOpenAttestation: () => initialState,
  },
});

export const { setFeatures } = featuresSlice.actions;
export const selectFeatures = (state: RootState) => {
  return state.features;
};
