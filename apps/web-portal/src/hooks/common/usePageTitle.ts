import { useEffect } from 'react';

import { FILESG_PAGE_TITLE } from '../../consts';

export function usePageTitle(title?: string, hasMainTitle = true) {
  useEffect(() => {
    const ogTitle = document.createElement('meta');

    if (title) {
      document.title = title + (hasMainTitle ? ` - ${FILESG_PAGE_TITLE}` : '');
      ogTitle.setAttribute('name', 'og:title');
      ogTitle.content = title + (hasMainTitle ? ` - ${FILESG_PAGE_TITLE}` : '');
      document.getElementsByTagName('head')[0].appendChild(ogTitle);
    } else {
      document.title = FILESG_PAGE_TITLE!;
      ogTitle.setAttribute('name', 'og:title');
      ogTitle.content = FILESG_PAGE_TITLE;
    }

    return () => {
      ogTitle?.parentNode?.removeChild(ogTitle);
    };
  }, [hasMainTitle, title]);
}
