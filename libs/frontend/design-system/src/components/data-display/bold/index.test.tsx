import { render, screen } from '../../../utils/test-utils';
import { Bold, Props } from '.';

const mockProps: Props = {
  type: 'FULL',
} as Props;

describe('Bold component', () => {
  it('should render correct text', () => {
    render(<Bold type="FULL">Hello World</Bold>);
    const boldComponent = screen.getByText('Hello World');
    expect(boldComponent.innerText).toEqual(mockProps.children);
  });

  it('should render font weight 700 when type is "FULL"', () => {
    render(<Bold {...mockProps}>Hello World</Bold>);
    const boldComponent = screen.getByText('Hello World');
    expect(boldComponent).toHaveStyle({ fontWeight: '700' });
  });

  it('should render font weight 600 when type is "SEMI"', () => {
    render(<Bold type="SEMI">Hello World</Bold>);
    const boldComponent = screen.getByText('Hello World');
    expect(boldComponent).toHaveStyle({ fontWeight: '600' });
  });

  it('should render font weight 500 when type is "MEDIUM"', () => {
    render(<Bold type="MEDIUM">Hello World</Bold>);
    const boldComponent = screen.getByText('Hello World');
    expect(boldComponent).toHaveStyle({ fontWeight: '500' });
  });
});
