import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { FILE_TYPE } from '../../../utils/typings';
import { FileIcon, Props } from '.';

const mockProps: Props = {
  type: 'oa',
  size: 'ICON_LARGE',
  variant: 'solid',
};

const testType: FILE_TYPE[] = ['oa', 'pdf', 'jpeg', 'jpg', 'png', 'zip', 'anything' as FILE_TYPE];

const getIconTypeName = (type) => {
  switch (type as FILE_TYPE) {
    case 'oa':
      return 'openattest';
    case 'pdf':
      return 'pdf';
    case 'jpg':
    case 'jpeg':
      return 'jpg';
    case 'png':
      return 'png';
    case 'zip':
      return 'zip';
    default:
      return 'unknown';
  }
};
describe('Render File Icon component', () => {
  it('should render', async () => {
    render(<FileIcon {...mockProps} />);
    const iconComponent = await screen.getByTestId(TEST_IDS.FILE_ICON);

    expect(iconComponent).toBeInTheDocument();
    expect(iconComponent).toHaveClass(`fsg-icon-file-openattest-solid`);
    expect(iconComponent).toHaveStyle({ fontSize: 18 });
  });

  it('should render various file type with correct icon and alt', () => {
    testType.forEach((fileType, index) => {
      render(<FileIcon {...mockProps} type={fileType} data-testid={`testing-${index}`} />);
      const iconComponent = screen.getByTestId(`testing-${index}`);
      expect(iconComponent).toBeInTheDocument();
      expect(iconComponent).toHaveClass(`fsg-icon-file-${getIconTypeName(fileType)}-solid`);
      expect(iconComponent).toHaveAccessibleName(`${fileType.toUpperCase()} file format icon`);
    });
  });
});
