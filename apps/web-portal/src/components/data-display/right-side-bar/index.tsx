import { TEST_IDS } from '../../../consts';
import { RightSideBarContainer, RightSideBarContentWrapper } from './style';

type Props = {
  children?: JSX.Element | null;
};

export function RightSideBar({ children = null }: Props): JSX.Element | null {
  return (
    <RightSideBarContainer data-testid={TEST_IDS.RIGHT_SIDE_BAR}>
      <RightSideBarContentWrapper>{children}</RightSideBarContentWrapper>
    </RightSideBarContainer>
  );
}
