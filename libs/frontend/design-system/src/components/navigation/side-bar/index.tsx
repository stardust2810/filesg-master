import { TEST_IDS } from '../../../utils/constants';
import { List } from '../../data-display/list';
import { IListItem } from '../../data-display/list/components/list-item';
import { StickyContentWrapper, StyledContainer } from './style';

interface Props {
  items: IListItem[];
}

export const Sidebar = ({ items }: Props) => {
  return (
    <StyledContainer data-testid={TEST_IDS.SIDEBAR}>
      <StickyContentWrapper>
        <List items={items} defaultExpandAll={true} />
      </StickyContentWrapper>
    </StyledContainer>
  );
};
