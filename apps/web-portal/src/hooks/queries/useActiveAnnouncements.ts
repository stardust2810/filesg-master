import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query';

import { useDownloadUrl } from './useDownloadUrl';

interface Announcement {
  id: string;
  title: string;
  description: string;
  displayStart: string;
  displayEnd: string;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
}

export const useActiveAnnouncements = () => {
  const useQueryReturns = useDownloadUrl('/config/announcements.json', { enabled: true, cacheTime: 0 }) as UseQueryResult<
    AnnouncementsResponse,
    AxiosError
  >;
  const { data } = useQueryReturns;

  const [transformedAnnouncements, setTransformedAnnouncements] = useState<Pick<Announcement, 'id' | 'title' | 'description'>[]>([]);

  useEffect(() => {
    if (data) {
      const today = new Date().getTime();
      const activeAnnouncements = data.announcements.filter(({ displayStart, displayEnd }) => {
        if (!displayStart || !displayEnd) {
          return false;
        }

        return new Date(displayStart).getTime() <= today && today <= new Date(displayEnd).getTime();
      });

      setTransformedAnnouncements(
        activeAnnouncements.map(({ id, title, description }) => {
          return {
            id,
            title,
            description,
          };
        }),
      );
    } else {
      setTransformedAnnouncements([]);
    }
  }, [data]);

  return {
    ...useQueryReturns,
    data: transformedAnnouncements,
  };
};
