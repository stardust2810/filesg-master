import { FileSGThemes } from '../../../styles/theme';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Props, Tag } from '.';

const mockProps: Props = {
  variant: 'FILLED',
  color: 'PRIMARY',
  size: 'DEFAULT',
  children: 'Powered by FileSG',
};

describe('Tag', () => {
  it('should have matching label', () => {
    render(<Tag {...mockProps} />);
    const tagComponent = screen.getByTestId(TEST_IDS.TAG);
    expect(tagComponent.textContent).toEqual(mockProps.children);
  });

  it('should have matching background color', () => {
    render(<Tag {...mockProps} />);
    const tagComponent = screen.getByTestId(TEST_IDS.TAG);
    expect(tagComponent).toHaveStyle(`background-color: ${FileSGThemes[0].FSG_COLOR[mockProps.color!].LIGHTEST}`);
  });

  it('should be of medium size', () => {
    render(<Tag {...mockProps} />);
    const tagTextComponent = screen.getByTestId(TEST_IDS.TAG_TEXT);

    expect(tagTextComponent).toHaveStyle(`font-size: ${FileSGThemes[0].FSG_FONT.SMALL.SIZE}`);
  });
});
