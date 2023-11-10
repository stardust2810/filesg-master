import { Color } from '../../../styles/color';
import { FSGFont } from '../../../typings/fsg-theme';
import { TEST_IDS } from '../../../utils/constants';
import { BoldVariant, FileSGProps } from '../../../utils/typings';
import { StyledSpan } from './style';

export type Props = {
  variant: keyof FSGFont;
  /**
   * Font weight of text
   * FULL: 700, SEMI: 600, MEDIUM: 500
   */
  bold?: BoldVariant;
  children: React.ReactNode | React.ReactNode[];
  ellipsisLine?: number;
  isEllipsis?: boolean;
  noWrap?: boolean;
  color?: Color;
  overrideFontFamily?: 'Work Sans'; // Note: this is standalone use for H3 and BODY typography
  asSpan?: boolean;
  underline?: boolean;
} & FileSGProps;

type HtmlTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

function mapVariantToStyleTag(variant: keyof FSGFont, asSpan: boolean): HtmlTag | undefined {
  if (asSpan) {
    return 'span';
  }

  switch (variant) {
    case 'DISPLAY1':
    case 'H1':
    case 'H1_MOBILE':
      return 'h1';
    case 'DISPLAY2':
    case 'H2':
    case 'H2_MOBILE':
      return 'h2';
    case 'H3':
    case 'H3_MOBILE':
      return 'h3';
    case 'H4':
      return 'h4';
    case 'H5':
      return 'h5';
    case 'H6':
      return 'h6';
    case 'PARAGRAPH':
    case 'PARAGRAPH_LARGE':
    case 'BODY':
    case 'SMALL':
    case 'SMALLER':
    case 'SMALL_CAPS':
      return 'p';
    case 'BUTTON_LARGE':
    case 'BUTTON_NORMAL':
    case 'BUTTON_SMALL':
    case 'ICON_LARGE':
    case 'ICON_MINI':
    case 'ICON_NORMAL':
    case 'ICON_SMALL':
      return 'span';
    default:
      assertUnreachable();
      return;
  }
}

export const Typography = ({ children, className, asSpan = false, underline = false, ...rest }: Props) => {
  return (
    <StyledSpan
      as={mapVariantToStyleTag(rest.variant, asSpan)}
      className={className}
      underline={underline}
      {...rest}
      data-testid={rest['data-testid'] ?? TEST_IDS.TEXT}
    >
      {children}
    </StyledSpan>
  );
};

const assertUnreachable = (): never => {
  throw new Error("Didn't expect to get here");
};
