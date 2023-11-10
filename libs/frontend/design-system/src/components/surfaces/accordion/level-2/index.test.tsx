import userEvent from '@testing-library/user-event';

import { TEST_IDS } from '../../../../utils/constants';
import { render, screen } from '../../../../utils/test-utils';
import { Level2Accordion, Props } from './';

const TEST_LABEL = 'Powered by FileSG';
const TEST_CONTENT = 'This is a testing text';
const mockProps: Props = {
  title: TEST_LABEL,
  isInitiallyOpen: false,
  children: TEST_CONTENT,
};

describe('Level 2 Accordion', () => {
  it('should have matching title, but missing content when it is initially not expanded', () => {
    render(<Level2Accordion {...mockProps} />);

    const titleText = screen.getByText(TEST_LABEL);
    const content = screen.getByTestId(TEST_IDS.ACCORDION_LEVEL_2_CONTENT);

    expect(titleText).toBeInTheDocument();
    expect(content.style.height).toEqual('0px');
  });

  it('should have both matching title ad content when it is expanded', () => {
    render(<Level2Accordion {...mockProps} />);

    const header = screen.getByTestId(TEST_IDS.ACCORDION_LEVEL_2_HEADER);
    userEvent.click(header);

    const titleText = screen.getByText(TEST_LABEL);
    const contentText = screen.queryByText(TEST_CONTENT);

    expect(titleText).toBeInTheDocument();
    expect(contentText).toBeInTheDocument();
  });
});
