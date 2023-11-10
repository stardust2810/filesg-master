import { BasicFileAssetResponse } from '@filesg/common';
import { FileSGProps, toKebabCase, Typography } from '@filesg/design-system';
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WebPage } from '../../../../../consts';
import Chip from './components/chip';
import { FilesWrapper, StyledCircle } from './style';

const TEST_IDS = {
  FILE_CHIP: 'file-chip',
  FILE_COUNT_BADGE: 'file-count-badge',
};

const CHIP_GAP = 8;
const BADGE_WIDTH = 32;

type Props = {
  files: BasicFileAssetResponse[];
  listName?: string;
  measure?: () => void;
  isPendingAcknowledgement?: boolean;
} & FileSGProps;

export const FileList = ({ files, measure, style, listName, isPendingAcknowledgement = false }: Props) => {
  const [parentWidth, setParentWidth] = useState<number>();
  const [displayTill, setDisplayTill] = useState<number>(files.length - 1);
  const [chipsWidth, setChipsWidth] = useState<Array<number>>([]);

  const fileWrapperRef = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();
  const fileUuids = files.map((file) => file.uuid);

  const chipRefs = useMemo(() => files.map(() => createRef<HTMLAnchorElement>()), [files]);
  const getChipRef = (index) => chipRefs[index];

  // ===========================================================================
  // Handlers
  // ===========================================================================
  const updateParentWidth = useCallback(() => {
    if (fileWrapperRef && fileWrapperRef.current && !chipsWidth.includes(0)) {
      // Check window width as parentUpdateWidth on window resize couldnt catch changes in width caused by left and right side bars
      let { width } = fileWrapperRef.current.getBoundingClientRect();
      const { innerWidth } = window;

      switch (innerWidth) {
        case 1024:
          width = 504;
          break;
        case 1023:
          width = 743;
          break;
        case 1280:
          width = 440;
          break;
        case 1279:
          width = 759;
          break;
        default:
          break;
      }
      setParentWidth(width);
    }
  }, [chipsWidth]);

  // ===========================================================================
  // useEffects
  // ===========================================================================
  useEffect(() => {
    // Use Math.ceil() to round up width with decimal
    setChipsWidth(chipRefs.map((chipRef) => (chipRef && chipRef.current ? Math.ceil(chipRef.current.getBoundingClientRect().width) : 0)));
  }, [chipRefs]);

  useEffect(() => {
    updateParentWidth();

    window.addEventListener('resize', updateParentWidth);
    return () => {
      window.removeEventListener('resize', updateParentWidth);
    };
  }, [updateParentWidth]);

  useEffect(() => {
    let totalWidth = 0;

    let displayTill = 0;
    chipsWidth.forEach((width, index) => {
      // First item, display regardless if badge fits
      if (index === 0 && parentWidth && width <= parentWidth) {
        displayTill = index;
      }

      totalWidth = totalWidth + width + CHIP_GAP;
      if (parentWidth && totalWidth + BADGE_WIDTH <= parentWidth) {
        displayTill = index;
      }
    });
    setDisplayTill(displayTill);
  }, [chipsWidth, parentWidth]);

  useEffect(() => {
    if (measure) {
      measure();
    }
  }, [measure, displayTill]);

  function isIndexHidden(index) {
    return index > displayTill;
  }

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <FilesWrapper style={style} ref={fileWrapperRef}>
      {files.map(({ name, uuid, type, isDeleted }, index) => {
        return (
          <Chip
            disabled={isDeleted || isPendingAcknowledgement}
            aria-disabled={isDeleted || isPendingAcknowledgement}
            style={isIndexHidden(index) ? { display: 'none' } : undefined}
            ref={getChipRef(index)}
            key={index}
            label={name}
            to={`..${WebPage.FILES}/${uuid}`}
            state={{ prevPath: pathname + search, fileAssetUuids: fileUuids }}
            type={type}
            data-testid={listName ? `${listName}-${TEST_IDS.FILE_CHIP}-${toKebabCase(name)}` : `${TEST_IDS.FILE_CHIP}-${toKebabCase(name)}`}
            aria-label={name}
          ></Chip>
        );
      })}
      {files.length - displayTill - 1 > 0 && (
        <StyledCircle data-testid={listName ? `${listName}-${TEST_IDS.FILE_COUNT_BADGE}` : `${TEST_IDS.FILE_COUNT_BADGE}}`}>
          <Typography variant={'SMALLER'}>+{files.length - displayTill - 1}</Typography>
        </StyledCircle>
      )}
    </FilesWrapper>
  );
};
