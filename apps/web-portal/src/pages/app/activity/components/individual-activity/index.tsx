import { ActivityDetailsResponse, formatBytes, URL_REGEX } from '@filesg/common';
import {
  Bold,
  Button,
  Color,
  DATE_FORMAT_PATTERNS,
  FileLabel,
  FSG_DEVICES,
  RESPONSIVE_VARIANT,
  TextLink,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { isEmail } from 'class-validator';
import { Fragment, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AcknowledgementModal } from '../../../../../components/feedback/modal/acknowledgement-modal';
import { TEST_IDS, WebPage } from '../../../../../consts';
import { useDisableContextMenu } from '../../../../../hooks/common/useDisableContextMenu';
import { formatDate } from '../../../../../utils/common';
import { StyledAcknowledgementBanner, StyledAcknowledgementInfo, StyledActivityInfo, StyledAdditionalInfoListItem } from './style';

interface Props {
  activity: ActivityDetailsResponse;
  isNonSingpassSession?: boolean;
  onFileLabelClick?: () => void;
}

const renderAdditionalInfoText = (txt: string, parentIndex: number) => (
  <Typography key={`para-${parentIndex}`} variant={'BODY'}>
    {txt.split(' ').map((part, index) => {
      let render: ReactNode;
      let seperator = '';
      if (/[^A-Za-z0-9]$/.test(part)) {
        seperator = part.substring(part.length - 1);
        part = part.slice(0, -1);
      }

      switch (true) {
        case URL_REGEX.test(part): {
          render = (
            <>
              <TextLink endIcon="sgds-icon-external" type="ANCHOR" to={part} newTab key={`text-${index}`} font={'BODY'}>
                {part}
              </TextLink>
              {seperator + ' '}
            </>
          );
          break;
        }

        case isEmail(part): {
          render = (
            <>
              <TextLink type="ANCHOR" to={`mailto:${part}`} key={`text-${index}`} newTab font={'BODY'}>
                {part}
              </TextLink>
              {seperator + ' '}
            </>
          );
          break;
        }

        default: {
          render = `${part + seperator + ' '}`;
          break;
        }
      }

      return <Fragment key={`para-${parentIndex}-${index}`}>{render}</Fragment>;
    })}
  </Typography>
);

type AcknowledgementBannerProps = {
  acknowledgedAt: Date | null;
  onButtonClick?: () => void;
};

export const IndividualActivity = ({ activity, isNonSingpassSession = false, onFileLabelClick }: Props) => {
  const setActive = useDisableContextMenu({ initialActive: false, selector: `[data-testid*='${TEST_IDS.ACTIVITY_FILES_ITEM}']` });
  const [showAcknowledgementModal, setShowAcknowledgementModal] = useState(false);

  useEffect(() => {
    if (isNonSingpassSession) {
      setActive(true);
    }
  }, [isNonSingpassSession, setActive]);

  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  const { pathname } = useLocation();

  const { transactionName, isAcknowledgementRequired, acknowledgedAt } = activity;
  const isPendingAcknowledgement = isAcknowledgementRequired && !acknowledgedAt;

  const AcknowledgementInfo = ({ acknowledgedAt }: AcknowledgementBannerProps) => {
    if (acknowledgedAt) {
      return (
        <StyledAcknowledgementBanner data-testid={TEST_IDS.ACKNOWLEDGEMENT_BANNER}>
          <StyledAcknowledgementInfo>
            <Typography variant="BODY">
              You have acknowledged the Terms and Conditions on: {`\n`}
              <Bold type="FULL">{formatDate(`${acknowledgedAt}`, DATE_FORMAT_PATTERNS.DATE_TIME)}</Bold>
            </Typography>
          </StyledAcknowledgementInfo>
          <Button
            style={{ flexShrink: 0 }}
            color="DEFAULT"
            label="View T&Cs"
            onClick={() => {
              setShowAcknowledgementModal(true);
            }}
          />
        </StyledAcknowledgementBanner>
      );
    }

    return (
      <StyledAcknowledgementBanner>
        <StyledAcknowledgementInfo>
          <Typography variant="BODY">
            <Bold type="FULL">Acknowledgement required: {`\n`}</Bold>
            To view or download the file(s) attached, please read and agree to the Terms and Conditions.
          </Typography>
        </StyledAcknowledgementInfo>
        <Button
          style={{ flexShrink: 0 }}
          label="Acknowledge"
          onClick={() => setShowAcknowledgementModal(true)}
          aria-label="Acknowledgement required"
        />
      </StyledAcknowledgementBanner>
    );
  };

  const onClick = (event: MouseEvent, isDeleted: boolean) => {
    if (isDeleted) {
      event.preventDefault();
    }
    onFileLabelClick?.();
  };

  return (
    <StyledActivityInfo data-testid={TEST_IDS.ACTIVITY_INFO_SECTION}>
      <Typography
        variant={isSmallerThanSmallTablet ? 'H1_MOBILE' : 'H1'}
        bold="FULL"
        color={Color.GREY80}
        data-testid={TEST_IDS.ACTIVITY_TITLE}
      >
        {transactionName}
      </Typography>

      <StyledAdditionalInfoListItem data-testid={TEST_IDS.ACTIVITY_ADDITIONAL_INFO}>
        {activity.customAgencyMessage &&
          activity.customAgencyMessage.map((para, index) => {
            return renderAdditionalInfoText(para, index);
          })}
      </StyledAdditionalInfoListItem>
      {/* Acknowledgement Info */}
      {activity.isAcknowledgementRequired && <AcknowledgementInfo acknowledgedAt={activity.acknowledgedAt} />}
      {/* Acknowledgement Modal */}
      {showAcknowledgementModal && (
        <AcknowledgementModal
          acknowledgedAt={acknowledgedAt}
          acknowledgementMessage={activity?.acknowledgementContent ?? null}
          activityUuid={activity.uuid}
          onClose={() => setShowAcknowledgementModal(false)}
        />
      )}
      <div data-testid={TEST_IDS.ACTIVITY_FILES}>
        {activity.files?.map(({ uuid, name, size, type, isDeleted }, index) => {
          const fileAssetUuids = activity.files?.reduce<string[]>((prev, file) => {
            if (!file.isDeleted) {
              prev.push(file.uuid);
            }
            return prev;
          }, []);

          return (
            <FileLabel
              onClick={(event) => onClick(event, isDeleted)}
              linkTo={`..${WebPage.FILES}/${uuid}`}
              linkState={{
                prevPath: pathname,
                fileAssetUuids,
              }}
              type={type}
              iconVariant="solid"
              name={name}
              size={formatBytes(size)}
              key={`${TEST_IDS.ACTIVITY_FILES_ITEM}-${index}`}
              data-testid={`${TEST_IDS.ACTIVITY_FILES_ITEM}-${index}`}
              isDisabled={isDeleted || isPendingAcknowledgement}
              tagMessage={isDeleted ? 'Deleted' : undefined}
            />
          );
        })}
      </div>
    </StyledActivityInfo>
  );
};
