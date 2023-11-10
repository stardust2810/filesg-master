import { useNavigate } from 'react-router-dom';

import errorImage from '../../../../../assets/images/common/error/browser-not-optimised.svg';
import { usePageTitle } from '../../../../../hooks/common/usePageTitle';
import { StyledError } from './style';

const PAGE_TITLE = 'Browser not supported';
const ERROR_DESCRIPTION = [
  'FileSG works best with the latest version of Chrome, Edge, Firefox and Safari. If you continue with your browser, you may run into problems.',
];

export default function BrowserNotSupported() {
  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(PAGE_TITLE);
  const navigate = useNavigate();

  const continueAnywayButton = {
    label: 'Continue Anyway',
    onClickHandler: () => navigate(-1),
  };
  return <StyledError image={errorImage} title={PAGE_TITLE} descriptions={ERROR_DESCRIPTION} buttons={[continueAnywayButton]} />;
}
