import { useEffect } from 'react';

import errorImage from '../../../../../assets/images/common/error/server-error.svg';
import { ExternalLink, WebPage } from '../../../../../consts';
import { usePageTitle } from '../../../../../hooks/common/usePageTitle';
import { useAppDispatch } from '../../../../../hooks/common/useSlice';
import { setHasUnexpectedError } from '../../../../../store/slices/app';
import { Link } from '../../base';
import { StyledError } from './style';

const PAGE_TITLE = 'Unexpected Error';
const ERROR_TITLE = 'An unexpected error has occurred';
const ERROR_DESCRIPTION = [
  'FileSG works best with the latest version of Chrome, Edge, Firefox and Safari browsers. Please try again later. If the problem persists, contact us for further assistance. ',
  'Here are some pages that might help:',
];

export default function UnexpectedError() {
  const dispatch = useAppDispatch();

  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(PAGE_TITLE);

  useEffect(() => {
    dispatch(setHasUnexpectedError(true));
    return () => {
      dispatch(setHasUnexpectedError(false));
    };
  }, [dispatch]);

  const links: Link[] = [
    { label: 'Contact Us', to: ExternalLink.CONTACT_US, isExternal: true },
    { label: 'Frequently Asked Questions', to: WebPage.FAQ },
  ];

  return (
    <StyledError style={{ paddingTop: '1rem' }} image={errorImage} title={ERROR_TITLE} descriptions={ERROR_DESCRIPTION} links={links} />
  );
}
