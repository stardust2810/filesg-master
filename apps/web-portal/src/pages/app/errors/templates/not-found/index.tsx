import React from 'react';

import errorImage from '../../../../../assets/images/common/error/page-not-found-error.svg';
import { WebPage } from '../../../../../consts';
import { usePageTitle } from '../../../../../hooks/common/usePageTitle';
import { Error, Link } from '../../base';

export default function NotFoundError() {
  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle('Page Not Found');

  const title = "We can't seem to find this page";

  const descriptions = [
    'It might have been removed, changed its name, or is otherwise unavailable.',
    'Here are some pages that might help:',
  ];

  const tagText = 'Error 404';

  const links: Link[] = [
    { label: 'Frequently Asked Questions', to: WebPage.FAQ },
    { label: 'Home', to: WebPage.ROOT },
  ];

  return <Error image={errorImage} tagText={tagText} title={title} descriptions={descriptions} links={links} />;
}
