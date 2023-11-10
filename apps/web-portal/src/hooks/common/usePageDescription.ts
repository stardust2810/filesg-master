import { useEffect } from 'react';

const DEFAULT_DESCRIPTION = 'Manage government-issued documents conveniently and safely.';
export function usePageDescription(pageDescription?: string) {
  useEffect(() => {
    const description = document.createElement('meta');
    const ogDescription = document.createElement('meta');

    ogDescription.setAttribute('name', 'og:description');
    ogDescription.content = pageDescription ?? DEFAULT_DESCRIPTION;
    description.setAttribute('name', 'description');
    description.content = pageDescription ?? DEFAULT_DESCRIPTION;
    document.getElementsByTagName('head')[0].appendChild(description);
    document.getElementsByTagName('head')[0].appendChild(ogDescription);

    return () => {
      for (const metaElement of [description, ogDescription]) {
        metaElement?.parentNode?.removeChild(metaElement);
      }
    };
  }, [pageDescription]);
}
