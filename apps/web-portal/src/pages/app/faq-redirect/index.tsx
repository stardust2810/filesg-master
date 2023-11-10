import { Navigate } from 'react-router-dom';

import { WebPage } from '../../../consts';
import { FAQ_MASTER_OBJECT } from '../faq/consts';

const firstItem = Object.entries(FAQ_MASTER_OBJECT)[0];

const FaqRedirect = () => {
  return <Navigate to={`${WebPage.FAQ}${firstItem[1].to}`} replace />;
};

export default FaqRedirect;
