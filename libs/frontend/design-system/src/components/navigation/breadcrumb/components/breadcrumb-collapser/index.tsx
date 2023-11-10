import { TEST_IDS } from '../../../../../utils/constants';
import { Icon } from '../../../../data-display/icon';
import { StyledListItem } from './style';
interface Props {
  onClick: () => void;
}

export const BreadcrumbCollapser = ({ onClick }: Props) => {
  return (
    <StyledListItem onClick={onClick} data-testid={TEST_IDS.BREADCRUMB_COLLAPSOR}>
      <Icon icon="sgds-icon-ellipsis" size="ICON_MINI" />
    </StyledListItem>
  );
};
