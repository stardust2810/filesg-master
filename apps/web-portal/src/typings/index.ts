import { ACTIVITY_SORT_BY, EXCEPTION_ERROR_CODE, FILE_ASSET_SORT_BY } from '@filesg/common';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

export type StyleProps = {
  style?: React.CSSProperties;
  className?: string;
};

export enum ItemViewType {
  GRID = 'grid',
  LIST = 'list',
}

interface FileSGErrorData extends Record<string, any> {
  data: { message: string; errorCode: EXCEPTION_ERROR_CODE };
}

type FileSGErrorResponse = AxiosResponse<FileSGErrorData>;

export interface IFileSGError extends AxiosError {
  response: FileSGErrorResponse;
}
export interface iBroadcastChannelMessage<T> {
  type: T;
  value?: string | boolean | Date;
}

export interface ListContent {
  title?: string | JSX.Element;
  isSameLevelSubsection?: boolean;
  content: string | JSX.Element | Array<string | JSX.Element | ListContent>;
}

export interface DownloadSaveFile {
  blob: Blob;
  filename: string;
}

export interface FileAssetSortOptions {
  sortBy: FILE_ASSET_SORT_BY;
  asc: boolean;
  agencyCodes?: string[] | null;
}

export interface ActivitiesSortOptions {
  sortBy: ACTIVITY_SORT_BY;
  asc: boolean;
  agencyCodes?: Array<string> | null;
}
