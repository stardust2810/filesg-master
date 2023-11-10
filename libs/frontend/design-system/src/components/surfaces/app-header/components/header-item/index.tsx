import { TEST_IDS } from '../../../../../utils/constants';
import { toKebabCase } from '../../../../../utils/helper';
import { HeaderActionButton, HeaderActionItem } from './components/header-action-button';
import { HeaderNavItem, HeaderNavLink } from './components/header-nav-link';

export type HeaderItemProps = HeaderNavItem | HeaderActionItem;

export const HeaderItem = (props: HeaderItemProps) => {
  const { testLocatorName, label, onDrawerClose, ...rest } = props;
  if ('to' in props) {
    return (
      <HeaderNavLink
        onDrawerClose={onDrawerClose}
        aria-label={rest['aria-label'] ?? undefined}
        data-testid={
          testLocatorName
            ? `${TEST_IDS.HEADER_NAV_LINK}-${testLocatorName}`
            : `${TEST_IDS.HEADER_NAV_LINK}${label && '-' + toKebabCase(label)}`
        }
        {...props}
      />
    );
  } else {
    return (
      <HeaderActionButton
        onDrawerClose={onDrawerClose}
        aria-label={rest['aria-label'] ?? undefined}
        data-testid={
          testLocatorName
            ? `${TEST_IDS.HEADER_ACTION_BUTTON}-${testLocatorName}`
            : `${TEST_IDS.HEADER_NAV_LINK}${label && '-' + toKebabCase(label)}`
        }
        {...props}
      />
    );
  }
};
