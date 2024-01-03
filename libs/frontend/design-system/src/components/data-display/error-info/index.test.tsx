import errorImage from '../../../assets/images/not-found.png';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { ErrorInfo, Props } from '.';

const mockProps: Props = {
  title: "We can't seem to find this page",
  image: errorImage,
  descriptions: ['It might have been removed, changed its name, or is otherwise unavailable.', 'Here are some pages that might help:'],
  tagText: 'Error 404',
  isCentered: false,
};
describe('ErrorInfo component', () => {
  beforeEach(() => {
    render(<ErrorInfo {...mockProps} />);
  });

  it('should render title', () => {
    const component = screen.getByTestId(TEST_IDS.INFO);
    expect(component).toBeInTheDocument();

    const titleComponent = screen.getByTestId(TEST_IDS.INFO_TITLE);
    expect(titleComponent.textContent).toEqual("We can't seem to find this page");
  });

  it('should render image alt', () => {
    render(<ErrorInfo {...mockProps} imageAltText={'test alt'} />);

    const imageComponent = screen.getByAltText('test alt');
    expect(imageComponent).toBeInTheDocument();
  });

  it('should render description', () => {
    const descriptionsComponents = screen.getAllByTestId(TEST_IDS.INFO_DESCRIPTION);

    expect(descriptionsComponents[0].textContent).toEqual(
      'It might have been removed, changed its name, or is otherwise unavailable.Here are some pages that might help:',
    );
  });

  it('should render children', () => {
    render(<ErrorInfo {...mockProps}>This is a test child</ErrorInfo>);

    const childComponent = screen.getByText('This is a test child');
    expect(childComponent).toBeInTheDocument();
  });

  it('should be centered when isCenter is true', () => {
    render(
      <ErrorInfo {...mockProps} isCentered={true} data-testid="center-test">
        This is a test child
      </ErrorInfo>,
    );
    const component = screen.getByTestId('center-test');

    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle({ margin: '0 auto', alignItems: 'center' });
  });
});
