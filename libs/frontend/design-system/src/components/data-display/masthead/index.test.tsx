import { FileSGThemes } from '../../../styles/theme';
import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { Masthead } from '.';
const NORMAL_TAB_LANDSCAPE = 1024;

describe('Masthead component', () => {
  it('should render individual components', async () => {
    render(<Masthead />);
    const mastHeadComponent = screen.getByTestId(TEST_IDS.MASTHEAD);
    const iconComponents = screen.queryAllByTestId(TEST_IDS.ICON);
    const textComponents = screen.queryAllByTestId(TEST_IDS.TEXT);

    expect(mastHeadComponent).toBeInTheDocument();
    expect(iconComponents.length).toBeGreaterThan(0);
    expect(textComponents.length).toBeGreaterThan(0);
    expect(textComponents[0].textContent).toBe('A Singapore Government Agency Website');
  });

  it(`should render smaller text when viewport is < ${NORMAL_TAB_LANDSCAPE}`, async () => {
    global.innerWidth = NORMAL_TAB_LANDSCAPE - 1;

    render(<Masthead />);
    const textComponents = screen.queryAllByTestId(TEST_IDS.TEXT);
    expect(textComponents[0]).toHaveStyle({ fontSize: FileSGThemes[0].FSG_FONT.SMALLER.SIZE });
  });

  it('should contain dropdown button', async () => {
    render(<Masthead />);
    const buttonComponent = screen.getByTestId(TEST_IDS.MASTHEAD_DROPDOWN_BUTTON);
    expect(buttonComponent).toBeInTheDocument();
  });

  describe('Identification method component', () => {
    it('should appear when button is clicked once', async () => {
      render(<Masthead />);
      const buttonComponent = screen.getByTestId(TEST_IDS.MASTHEAD_DROPDOWN_BUTTON);
      let identificationMethodComponent = screen.queryByTestId(TEST_IDS.MASTHEAD_IDENTIFICATION_METHODS);
      expect(identificationMethodComponent).not.toBeInTheDocument();
      fireEvent.click(buttonComponent);
      identificationMethodComponent = screen.queryByTestId(TEST_IDS.MASTHEAD_IDENTIFICATION_METHODS);
      expect(identificationMethodComponent).toBeInTheDocument();
    });
  });
});
