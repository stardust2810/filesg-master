import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Carousel } from '.';

const Slide = ({ index }: { index: number }) => (
  <div
    style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#c6c6c6' }}
  >
    This is slide {index}
  </div>
);

const slides = [1, 2, 3].map((num) => <Slide index={num} />);

const mockProps = {
  slideItems: slides,
};

/**
 * Note: Active class is not set in unit test, to add in tests to determine which slide is
 * active once this issue is resolved
 *
 * Test required: active slide, keyleft keyright
 *
 * https://github.com/nolimits4web/swiper/issues/5722
 */
describe('Carousel component', () => {
  it('should render', () => {
    render(
      <div style={{ width: '100%' }}>
        <Carousel {...mockProps} />
      </div>,
    );

    const component = screen.getByTestId(TEST_IDS.CAROUSEL);
    expect(component).toBeInTheDocument();

    const paginationComponent = screen.queryByTestId(TEST_IDS.CAROUSEL_PAGINATION);
    expect(paginationComponent).not.toBeInTheDocument();
  });

  it('should render pagination when enabled', () => {
    render(
      <div style={{ width: '100%' }}>
        <Carousel {...mockProps} enablePagination />
      </div>,
    );

    const component = screen.getByTestId(TEST_IDS.CAROUSEL);
    expect(component).toBeInTheDocument();

    const paginationComponent = screen.queryByTestId(TEST_IDS.CAROUSEL_PAGINATION);
    expect(paginationComponent).toBeInTheDocument();
  });
});
