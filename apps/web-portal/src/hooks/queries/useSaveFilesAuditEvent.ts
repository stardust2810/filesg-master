import { AUDIT_EVENT_NAME, UserFilesNonSingpassAuditEventRequest, UserFilesSingpassAuditEventRequest } from '@filesg/common';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectHasPerformedDocumentAction, setHasPerformedDocumentAction } from '../../store/slices/non-singpass-session';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppDispatch, useAppSelector } from '../common/useSlice';

interface FilesAuditEventQueryBody {
  fileAssetUuids: string[];
  eventName: AUDIT_EVENT_NAME;
}

export const useSaveFilesAuditEvent = (contentRetrievalToken: string) => {
  const dispatch = useAppDispatch();
  const hasPerformedDocumentAction = useAppSelector(selectHasPerformedDocumentAction);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const saveFilesAuditEvent = async ({ fileAssetUuids, eventName }: FilesAuditEventQueryBody) => {
    const config = contentRetrievalToken
      ? {
          headers: {
            Authorization: `Bearer ${contentRetrievalToken}`,
          },
        }
      : undefined;

    const medium = getRoutePath(null, isCorporateUser && isCorppassEnabled);
    const url = `/v1/audit-event${medium}/files/${eventName}`;

    await apiCoreServerClient.post<UserFilesSingpassAuditEventRequest | UserFilesNonSingpassAuditEventRequest>(
      url,
      { fileAssetUuids, hasPerformedDocumentAction: contentRetrievalToken ? hasPerformedDocumentAction : undefined },
      config,
    );
  };
  /**
   * saveFilesAuditEvent is a best effort action that will not affect the front end view.
   * The call will retry 3 times on error.
   **/
  return useMutation(saveFilesAuditEvent, {
    retry: 3,
    onSuccess: () => {
      contentRetrievalToken && !hasPerformedDocumentAction && dispatch(setHasPerformedDocumentAction(true));
    },
  });
};
