import { FILE_ASSET_ACTION, FileHistory, REVOCATION_TYPE, USER_TYPE } from '@filesg/common';
import { Avatar, Bold, Color, DATE_FORMAT_PATTERNS, Modal, Typography } from '@filesg/design-system';
import { LegacyRef, ReactElement, useEffect, useState } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List } from 'react-virtualized';

import { useAppSelector } from '../../../../hooks/common/useSlice';
import { useFileAssetHistory } from '../../../../hooks/queries/useFileAssetHistory';
import { selectContentRetrievalToken } from '../../../../store/slices/non-singpass-session';
import { formatDate } from '../../../../utils/common';
import {
  StyledBody,
  StyledDate,
  StyledFileHistoryContent,
  StyledFileHistoryItem,
  StyledHistoricalRecord,
  StyledModal,
  StyledNoRecord,
  UserDisplayText,
  VirtualizedList,
} from './style';

interface iFileHistoryProps {
  onClose: () => void;
  fileAssetId: string;
}

const MODAL_TITLE = 'File History';
const INITIAL_PAGE_TO_FETCH = 1;
const ITEMS_PER_FETCH = 10;
const FETCH_OFFSET = 5;
const FILE_HISTORY_CARD_HEIGHT = 88;

export const FileHistoryModal = ({ fileAssetId, onClose }: iFileHistoryProps) => {
  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);

  const [fileHistory, setFileHistory] = useState<FileHistory[]>([]);
  const [totalListHeight, setTotalListHeight] = useState(0);
  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const infiniteQueryResult = useFileAssetHistory(
    { page: INITIAL_PAGE_TO_FETCH, limit: ITEMS_PER_FETCH },
    { fileAssetId },
    contentRetrievalToken,
  );
  const { isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, data } = infiniteQueryResult;

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (data) {
      const tempList: FileHistory[] = [];

      data.pages.forEach((page) => {
        page.fileHistory.forEach((record) => {
          tempList.push(record);
        });
      });
      setFileHistory(tempList);
    }
  }, [data]);

  // ---------------------------------------------------------------------------
  // List rendering
  // ---------------------------------------------------------------------------
  const displayMapForRevocationType: Partial<Record<REVOCATION_TYPE, (historicalRecord: FileHistory) => ReactElement>> = {
    [REVOCATION_TYPE.CANCELLED]: (historicalRecord) => {
      return (
        <>
          <Bold type="FULL">{historicalRecord!.actionBy}</Bold> cancelled the document.
        </>
      );
    },
    [REVOCATION_TYPE.EXPIRED]: () => {
      return <>The document has expired and has been cancelled.</>;
    },
    [REVOCATION_TYPE.UPDATED]: (historicalRecord) => {
      return (
        <>
          <Bold type="FULL">{historicalRecord!.actionBy}</Bold> cancelled the document due to change of particulars.
        </>
      );
    },
  };

  const displayTextMapFileActionType: Partial<Record<FILE_ASSET_ACTION, (historicalRecord: FileHistory) => ReactElement>> = {
    [FILE_ASSET_ACTION.ISSUED]: (historicalRecord) => {
      return (
        <>
          <Bold type="FULL">{historicalRecord.actionBy}</Bold> issued the document.
        </>
      );
    },
    [FILE_ASSET_ACTION.REVOKED]: (historicalRecord) => {
      return displayMapForRevocationType[historicalRecord.revocationType!]!(historicalRecord);
    },
    [FILE_ASSET_ACTION.EXPIRED]: (historicalRecord) => {
      return displayMapForRevocationType[historicalRecord.revocationType!]!(historicalRecord);
    },
    [FILE_ASSET_ACTION.DOWNLOADED]: (historicalRecord) => {
      return (
        <>
          <Bold type="FULL">{historicalRecord.actionBy}</Bold> downloaded the document.
        </>
      );
    },
  };

  // [REACT_VIRTUALISED]: Take default height as 112px: Desktop view without long filename
  const cache = new CellMeasurerCache({
    defaultHeight: FILE_HISTORY_CARD_HEIGHT,
    fixedWidth: true,
  });

  function rowRenderer({ index, key, style, parent }) {
    const fileHistoryRecord = fileHistory[index];

    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {({ measure, registerChild }) => (
          <div style={style} onLoad={measure} ref={registerChild as LegacyRef<HTMLDivElement>}>
            <StyledHistoricalRecord key={index} style={{ paddingBottom: index === fileHistory.length - 1 ? '0.75rem' : '0' }}>
              <StyledDate>
                <Typography
                  variant="SMALL"
                  bold="FULL"
                  data-testid={`${fileHistoryRecord.uuid}-record-date-description`}
                  color={Color.GREY60}
                >
                  {formatDate(`${fileHistoryRecord.createdAt}`, DATE_FORMAT_PATTERNS.DATE)}
                </Typography>
              </StyledDate>
              <StyledFileHistoryItem>
                {renderDisplayPic(fileHistoryRecord)}
                {renderFileHistoryContent(fileHistoryRecord)}
              </StyledFileHistoryItem>
            </StyledHistoricalRecord>
          </div>
        )}
      </CellMeasurer>
    );
  }

  function renderDisplayPic(fileHistoryRecord: FileHistory) {
    const { uuid, actionBy, actionByType } = fileHistoryRecord;

    if (actionByType !== USER_TYPE.CITIZEN) {
      return (
        <Avatar
          data-testid={`${fileHistoryRecord.uuid}-record-display-icon-description`}
          imageUrl={`/assets/images/icons/agency/${actionBy.toLocaleLowerCase()}/emblem.png`}
          alt={`${actionBy} Logo`}
        />
      );
    }

    return (
      <UserDisplayText data-testid={`${uuid}-record-display-icon-char-description`}>
        <Typography variant="PARAGRAPH" bold="FULL" style={{ lineHeight: '2rem' }}>
          {actionBy[0]}
        </Typography>
      </UserDisplayText>
    );
  }

  function renderFileHistoryContent(fileHistoryRecord: FileHistory) {
    const { uuid, type, createdAt } = fileHistoryRecord;
    return (
      <StyledFileHistoryContent>
        <Typography variant="BODY" data-testid={`${uuid}-content-description`}>
          {displayTextMapFileActionType[type]!(fileHistoryRecord)}
        </Typography>
        <Typography variant="SMALLER" data-testid={`${uuid}-record-time-description`} color={Color.GREY60}>
          {formatDate(`${createdAt}`, DATE_FORMAT_PATTERNS.TIME)}
        </Typography>
      </StyledFileHistoryContent>
    );
  }

  // [REACT_VIRTUALISED]: Triggered when isRowLoaded returns false
  const loadMoreRows = () => {
    if (isFetchingNextPage) {
      return Promise.resolve();
    }
    return fetchNextPage();
  };

  const isRowLoaded = ({ index }) => {
    // [REACT_VIRTUALISED]: Return false to indicate the items are not loaded and will trigger loadMoreRows to fetchNextPage
    return !(fileHistory.length - index === FETCH_OFFSET) || !hasNextPage;
  };

  // Add onResize handler to handle clear CellMeasurerCache due to change in height caused by different viewport width
  const onResize = () => {
    cache.clearAll();
  };

  const onRowRendered = () => {
    let totalheight = 0;
    for (let x = 0; x < fileHistory.length; x++) {
      totalheight += cache.getHeight(x, 0);
    }
    if (totalheight >= totalListHeight) {
      setTotalListHeight(totalheight);
    }
  };

  function renderList() {
    return (
      <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={fileHistory.length}>
        {({ onRowsRendered, registerChild }) => {
          return (
            <VirtualizedList style={{ height: `${totalListHeight | (fileHistory.length * FILE_HISTORY_CARD_HEIGHT)}px` }}>
              <AutoSizer onResize={onResize}>
                {({ width, height }) => (
                  <List
                    height={height}
                    width={width}
                    deferredMeasurementCache={cache}
                    onRowsRendered={(indexRange) => {
                      onRowsRendered(indexRange);
                      onRowRendered();
                    }}
                    ref={registerChild}
                    rowCount={fileHistory.length}
                    rowHeight={cache.rowHeight}
                    rowRenderer={rowRenderer}
                    tabIndex={-1}
                  />
                )}
              </AutoSizer>
            </VirtualizedList>
          );
        }}
      </InfiniteLoader>
    );
  }

  function renderFileHistory() {
    switch (true) {
      case isLoading:
        return (
          <StyledNoRecord>
            <Typography variant="BODY" data-testid={`no-file-asset-history-description`}>
              Loading records...
            </Typography>
          </StyledNoRecord>
        );
      case fileHistory.length > 0:
        return renderList();
      case fileHistory.length === 0:
        return (
          <StyledNoRecord>
            <Typography variant="BODY" data-testid={`no-file-asset-history-description`}>
              No records found.
            </Typography>
          </StyledNoRecord>
        );
      default:
        return null;
    }
  }

  return (
    <StyledModal onBackdropClick={onClose}>
      <Modal.Card>
        <Modal.Header onCloseButtonClick={onClose}>
          <Modal.Title>{MODAL_TITLE}</Modal.Title>
        </Modal.Header>
        <StyledBody>{renderFileHistory()}</StyledBody>
      </Modal.Card>
    </StyledModal>
  );
};
