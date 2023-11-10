import {
  Breadcrumb as FSGBreadcrumb,
  BreadcrumbItem,
  Color,
  FSG_DEVICES,
  Icon,
  RESPONSIVE_VARIANT,
  Typography,
  useShouldRender,
} from '@filesg/design-system';

import { StyledNavLink } from './style';

interface Props {
  items: BreadcrumbItem[];
  enableNav?: boolean;
  reverse?: boolean;
  maxWidth?: number;
}

export const Breadcrumb = ({ items, enableNav = true, reverse = false, maxWidth = 150 }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  return (
    <FSGBreadcrumb
      separator={<Icon size="ICON_MINI" icon={reverse ? 'sgds-icon-chevron-left' : 'sgds-icon-chevron-right'} color={Color.GREY30} />}
      itemMaxWidth={maxWidth ? maxWidth : 150}
      reverse={reverse}
      reverseIncludeLast={false}
    >
      {items.length !== 0 &&
        (reverse ? [items[items.length !== 1 ? items.length - 2 : 0]] : items).map(({ label, to }, index) => {
          return (
            <StyledNavLink
              end
              to={to}
              key={`breadcrumb-item-${index}`}
              $enableNav={enableNav}
              tabIndex={!enableNav ? -1 : undefined}
              children={({ isActive }) => {
                return isActive ? (
                  <Typography
                    variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'}
                    color={Color.GREY80}
                    bold="SEMI"
                    overrideFontFamily="Work Sans"
                  >
                    {label}
                  </Typography>
                ) : (
                  <Typography
                    variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'}
                    color={Color.GREY60}
                    bold="MEDIUM"
                    overrideFontFamily="Work Sans"
                  >
                    {label}
                  </Typography>
                );
              }}
            />
          );
        })}
    </FSGBreadcrumb>
  );
};
