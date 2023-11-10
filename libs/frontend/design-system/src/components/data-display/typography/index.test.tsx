import { Color } from '../../../styles/color';
import { FileSGThemes } from '../../../styles/theme';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Props, Typography } from '.';

const mockProps: Props = {
  variant: 'BODY',
  bold: 'FULL',
  children: 'Text label',
  ellipsisLine: 3,
  isEllipsis: true,
  color: Color.BLACK,
};

describe('Render Text component', () => {
  it('Tests if children label matches', () => {
    render(<Typography {...mockProps} />);
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);

    expect(textComponent.textContent).toEqual(mockProps.children);
  });

  it('Tests if correct styles render', () => {
    render(<Typography {...mockProps} />);
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);
    const { variant } = mockProps;

    expect(textComponent).toHaveStyle({ fontWeight: '700' });
    expect(textComponent).toHaveStyle({ fontSize: FileSGThemes[0].FSG_FONT[variant].SIZE });
    expect(textComponent).toHaveStyle({ lineHeight: FileSGThemes[0].FSG_FONT[variant].LINE_HEIGHT });
    expect(textComponent).toHaveStyle({
      fontFamily: 'Noto Sans,Helvetica Neue,Helvetica,Arial,sans-serif',
    });
    expect(textComponent).toHaveStyle({ color: Color.BLACK });
  });
});
