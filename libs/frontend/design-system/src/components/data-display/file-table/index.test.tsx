import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { FileTable } from '.';

const mockColumns = [
  {
    field: 'documentType',
    width: 32,
    minWidth: 32,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 900,
    ellipsis: true,
    ellipsisLine: 1,
  },
  {
    field: 'updatedAt',
    headerName: 'Updated',
    width: 260,
    minWidth: 120,
    hiddenOnMobile: true,
  },
  {
    field: 'expireAt',
    headerName: 'Status',
    width: 260,
    minWidth: 80,
    hiddenOnMobile: true,
  },
  {
    field: 'listButton',
    width: 36,
    minWidth: 36,
  },
];

const mockRows = [
  {
    id: `TEST-ID-1`,
    agencyCode: 'TEST CODE',
    name: 'TEST_NAME.pdf',
    documentType: 'pdf',
    updatedAt: `TEST UPDATE DATE`,
    expireAt: `TEST EXPIRY DATE`,
  },
  {
    id: `TEST-ID-2`,
    agencyCode: 'TEST CODE',
    name: 'TEST_NAME.pdf',
    documentType: 'pdf',
    updatedAt: `TEST UPDATE DATE`,
    expireAt: `TEST EXPIRY DATE`,
  },
];

const FileTableWrapper = () => {
  return <FileTable rows={mockRows} columns={mockColumns} checkboxSelection />;
};

describe('Render File Table Component', () => {
  //AutoSizer requires actual DOM, issue in https://github.com/bvaughn/react-virtualized/issues/493
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 50 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 50 });
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight as PropertyDescriptor);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth as PropertyDescriptor);
  });

  it('Tests if File Table components renders', () => {
    render(<FileTableWrapper />);
    const fileTableComponent = screen.getByTestId(TEST_IDS.FILE_TABLE);
    const checkboxComponents = screen.getAllByTestId(TEST_IDS.CHECKBOX);
    const textComponents = screen.getAllByTestId(TEST_IDS.TEXT);

    expect(fileTableComponent).toBeInTheDocument();
    expect(checkboxComponents.length).toEqual(1 + mockRows.length);
    expect(textComponents.length).toEqual(5 * (mockRows.length + 1));
  });
});
