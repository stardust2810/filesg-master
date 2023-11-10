import { useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';

export const useHiddenAnnouncementIds = () => {
  const [cookies, setCookies] = useCookies();
  const hiddenAnnouncementIds = useMemo(() => {
    return Object.keys(cookies)
      .filter((key) => key.startsWith('hidden-announcement-'))
      .map((key) => cookies[key]);
  }, [cookies]);

  const hideAnnouncement = useCallback(
    (announcementId: string) => {
      setCookies(`hidden-announcement-${announcementId}`, announcementId, {
        maxAge: 60 * 60 * 24, // 1 day
      });
    },
    [setCookies],
  );

  return {
    hiddenAnnouncementIds,
    hideAnnouncement,
  };
};
