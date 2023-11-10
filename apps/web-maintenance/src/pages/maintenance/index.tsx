import { AppHeader, Bold, Color, Error, Footer, Masthead, Typography } from '@filesg/design-system';
import { format, fromUnixTime, isSameDay } from 'date-fns';
import React, { useCallback } from 'react';

import maintenanceImage from '../../assets/images/maintenance.svg';
import { config } from '../../config/app-config';
import { DATE_ONLY_FORMAT, DATE_TIME_FORMAT, TIME_ONLY_FORMAT } from '../../consts/dateFormat';
import { useActiveMaintenanceDuration } from '../../hooks/useActiveMaintenanceDuration';
import { BodyAndRightSidebarContainer, BodyRow, HeaderAndBodyContainer, LayoutContainer, NavBarContainer } from './style';

const { title, footerBackgrdColor, description, updatedDate } = {
  title: 'FileSG',
  description:
    'FileSG is a secure digital document management platform that allows members of the public to easily access and download documents issued by the government.',
  updatedDate: fromUnixTime(config.lastBuiltAt),
  footerBackgrdColor: Color.BLACK,
};

function Maintenance() {
  const { data, error } = useActiveMaintenanceDuration();

  // ===========================================================================
  // Handlers
  // ===========================================================================
  const onLogoClickHandler = useCallback(() => {
    window.location.reload();
  }, []);

  // ===========================================================================
  // Render
  // ===========================================================================

  const getFormattedDuration = (startTime: Date, endTime: Date): string => {
    if (isSameDay(startTime, endTime)) {
      return `${format(startTime, DATE_ONLY_FORMAT)}, ${format(startTime, TIME_ONLY_FORMAT)} to ${format(endTime, TIME_ONLY_FORMAT)}`;
    }

    return `${format(startTime, DATE_TIME_FORMAT)} to ${format(endTime, DATE_TIME_FORMAT)}`;
  };

  const getDesc = (): (string | React.ReactElement)[] => {
    if (error || !data?.startTime || !data?.endTime) {
      return ['FileSG is undergoing maintenance and will be back shortly.', 'Thank you for your understanding.'];
    }

    return [
      <Typography variant="BODY" key={`filesg-info-description-0`}>
        FileSG is undergoing scheduled maintenance and will be unavailable from <br />
        <Bold type="FULL">{getFormattedDuration(data.startTime, data.endTime)}</Bold>
      </Typography>,
      'Thank you for your understanding.',
    ];
  };

  return (
    <LayoutContainer>
      <HeaderAndBodyContainer>
        <NavBarContainer>
          <Masthead />
          <AppHeader onLogoClick={onLogoClickHandler} />
        </NavBarContainer>

        <BodyRow>
          <BodyAndRightSidebarContainer>
            <Error image={maintenanceImage} title="Under Maintenance" descriptions={getDesc()} />
          </BodyAndRightSidebarContainer>
        </BodyRow>
      </HeaderAndBodyContainer>
      <Footer
        title={title}
        description={description}
        updatedDate={updatedDate}
        footerBackgrdColor={footerBackgrdColor}
        topSectionLinks={[]}
        bottomSectionLinks={[]}
      />
    </LayoutContainer>
  );
}

export default Maintenance;
