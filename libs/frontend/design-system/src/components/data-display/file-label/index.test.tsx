import { MemoryRouter, Route, Router, Routes } from 'react-router-dom';

import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { FileLabel, Props } from '.';
import { createMemoryHistory } from 'history';

const TEST_ERROR_MESSAGE = 'Test Error Message';

const mockProps: Props = {
  name: 'testfile1.oa',
  size: '10MB',
  type: 'oa',
  iconVariant: 'solid',
  linkTo: '/destination',
  linkState: {
    testing: 'link-state',
  },
};

describe('File Label', () => {
  it('should render name, size and icon', async () => {
    render(
      <MemoryRouter>
        <FileLabel {...mockProps} />
      </MemoryRouter>,
    );
    const fileLabelComponent = screen.getByTestId(TEST_IDS.FILE_LABEL);
    const fileIconComponent = screen.getByTestId(TEST_IDS.FILE_ICON);
    const iconComponent = screen.getByTestId(TEST_IDS.FILE_LABEL_ICON);
    const descriptorComponent = screen.getByTestId(TEST_IDS.FILE_LABEL_DESCRIPITORS);

    expect(fileLabelComponent).toBeInTheDocument();
    expect(fileIconComponent).toBeInTheDocument();
    expect(iconComponent).toBeInTheDocument();
    expect(descriptorComponent).toBeInTheDocument();
    expect(descriptorComponent).toHaveTextContent('testfile1.oa');
    expect(descriptorComponent).toHaveTextContent('10MB');
    expect(fileIconComponent).toHaveAccessibleName('OA file format icon');
    expect(iconComponent).toHaveClass('sgds-icon-arrow-right');
  });

  it('should route to linkto on click, with linkstate passed to next page', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <Router location={history.location} navigator={history}>
        <FileLabel {...mockProps} />
      </Router>,
    );
    const fileLabelComponent = screen.getByTestId(TEST_IDS.FILE_LABEL);

    expect(history.location.pathname).toBe('/');
    fireEvent.click(fileLabelComponent);
    expect(history.location.pathname).toBe('/destination');
    expect(history.location.state).toStrictEqual({ testing: 'link-state' });
  });

  it('should render error message', () => {
    mockProps.errorMessage = TEST_ERROR_MESSAGE;
    render(
      <MemoryRouter>
        <FileLabel {...mockProps} />
      </MemoryRouter>,
    );
    const iconLabelComponent = screen.getByTestId(TEST_IDS.ICON_LABEL);

    expect(iconLabelComponent).toBeInTheDocument();
    expect(iconLabelComponent.textContent).toEqual(TEST_ERROR_MESSAGE);
  });
});
