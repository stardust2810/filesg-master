import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../hooks/common/useSlice';
import {
  resetNonSingpassSessionDueToActivityBan,
  resetNonSingpassSessionExceptFirstFaInput,
  selectFirstFaToken,
} from '../../../../store/slices/non-singpass-session';
import { FirstFactorAuthModal } from './components/first-fa-modal';
import { SecondFactorAuthModal } from './components/second-fa-modal';

interface Props {
  onClose: () => void;
  onBackButtonClick: () => void;
}

export const NonSingpassLoginModal = ({ onClose, onBackButtonClick }: Props) => {
  const dispatch = useAppDispatch();
  const firstFaToken = useAppSelector(selectFirstFaToken);

  const [isSecondFactorAuthModalVisible, setIsSecondFactorAuthModalVisible] = useState(false);

  const handle2FaReset = () => {
    setIsSecondFactorAuthModalVisible(false);
    dispatch(resetNonSingpassSessionExceptFirstFaInput());
  };

  const handle2FaActivityBannedBackButtonClick = () => {
    onBackButtonClick();
    dispatch(resetNonSingpassSessionDueToActivityBan());
  };

  return !isSecondFactorAuthModalVisible && !firstFaToken ? (
    <FirstFactorAuthModal
      onBackButtonClick={onBackButtonClick}
      onClose={onClose}
      setIsSecondFactorAuthModalVisible={setIsSecondFactorAuthModalVisible}
    />
  ) : (
    <SecondFactorAuthModal
      onBackButtonClick={handle2FaReset}
      onActivityBannedBackButtonClick={handle2FaActivityBannedBackButtonClick}
      onUnexpectedError={handle2FaReset}
    />
  );
};
