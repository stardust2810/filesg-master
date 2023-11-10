import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Info, Props } from '.';

const mockProps: Props = {
  image: 'any-image-source',
  title: 'Title',
  descriptions: ['desc-A', 'desc-B'],
};

describe('Info component', () => {
  it('Tests if info, image, title and descriptions renders', () => {
    render(<Info {...mockProps} />);

    const infoContainer = screen.getByTestId(TEST_IDS.INFO);
    const iconComponent = screen.getByAltText('');
    const textComponents = screen.getAllByTestId(TEST_IDS.INFO_DESCRIPTION);

    expect(infoContainer).toBeInTheDocument();
    expect(iconComponent).toBeInTheDocument();
    expect(textComponents.length).toEqual(2);
  });

  it('should render title', () => {
    render(<Info {...mockProps} />);

    const component = screen.getByTestId(TEST_IDS.INFO);
    expect(component).toBeInTheDocument();

    const titleComponent = screen.getByTestId(TEST_IDS.INFO_TITLE);
    expect(titleComponent.textContent).toEqual('Title');
  });

  it('should render image with given src', () => {
    render(<Info {...mockProps} />);

    const imageComponent = screen.getByTestId(TEST_IDS.INFO_IMAGE);

    expect(imageComponent).toHaveAttribute('src', mockProps.image);
  });

  it('should render image alt', () => {
    render(<Info {...mockProps} />);

    const imageWithoutAltComponent = screen.getByAltText('');
    expect(imageWithoutAltComponent).toBeInTheDocument();

    render(<Info {...mockProps} imageAltText={'test alt'} />);

    const imageComponent = screen.getByAltText('test alt');
    expect(imageComponent).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<Info {...mockProps} />);

    const descriptionsComponents = screen.getAllByTestId(TEST_IDS.INFO_DESCRIPTION);

    expect(descriptionsComponents[0].textContent).toEqual('desc-A');
    expect(descriptionsComponents[1].textContent).toEqual('desc-B');
  });

  it('should not render description if no desc is pass in', () => {
    render(<Info {...mockProps} descriptions={undefined} />);
    const descriptionsComponents = screen.queryByTestId(TEST_IDS.INFO_DESCRIPTION);

    expect(descriptionsComponents).not.toBeInTheDocument();
  });
});
