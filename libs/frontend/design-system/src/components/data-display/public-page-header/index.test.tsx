import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Props, PublicPageDescriptor } from '.';

const mockProps: Props = {
  title: 'Page Title',
  description: 'Page description - Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};

describe('PublicPageDescriptor', () => {
  it('should render title, description and image', () => {
    render(<PublicPageDescriptor {...mockProps} />);
    const titleComponent = screen.getByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_TITLE);
    const descriptionComponent = screen.getByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_DESCRIPTION);
    const imageComponent = screen.queryByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_IMAGE);

    const { title, description } = mockProps;
    expect(titleComponent.textContent).toBe(title);
    expect(descriptionComponent.textContent).toBe(description);
    expect(imageComponent).not.toBeInTheDocument();
  });

  it('should render image when src is given', () => {
    const testSrc = 'test-src';
    render(<PublicPageDescriptor {...mockProps} image={testSrc} />);
    const titleComponent = screen.getByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_TITLE);
    const descriptionComponent = screen.getByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_DESCRIPTION);
    const imageComponent = screen.getByTestId(TEST_IDS.PUBLIC_PAGE_HEADER_IMAGE);

    const { title, description } = mockProps;
    expect(titleComponent.textContent).toBe(title);
    expect(descriptionComponent.textContent).toBe(description);
    expect(imageComponent).toHaveAttribute('alt', '');
    expect(imageComponent).toHaveAttribute('src', testSrc);
  });
});
