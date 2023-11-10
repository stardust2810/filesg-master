import { ThemeProvider } from 'styled-components';

import { FileSGThemes } from '../src';
import { WithStyles } from '../src/utils/withStyles';

const FILESG_VIEWPORTS = {
  galaxys9: {
    name: 'Galaxy S9 (Normal Mobile)',
    styles: {
      height: '740px',
      width: '360px',
    },
    type: 'mobile',
  },
  iphone5: {
    name: 'iPhone 5 (Small Mobile)',
    styles: {
      height: '568px',
      width: '320px',
    },
    type: 'mobile',
  },
  galaxyTab2: {
    name: 'Galaxy Tab 2 (Small Tablet)',
    styles: {
      height: '1024px',
      width: '600px',
    },
    type: 'tablet',
  },
  ipad: {
    name: 'iPad (Normal Tablet)',
    styles: {
      height: '1024px',
      width: '768px',
    },
    type: 'tablet',
  },
  smallMonitor: {
    name: 'Monitor (Small Desktop)',
    styles: {
      height: '720px',
      width: '1280px',
    },
    type: 'desktop',
  },
  normalMonitor: {
    name: 'Monitor (Normal Desktop)',
    styles: {
      height: '900px',
      width: '1440px',
    },
    type: 'desktop',
  },
  largeMonitor: {
    name: 'Monitor (Large Desktop)',
    styles: {
      height: '1080px',
      width: '1920px',
    },
    type: 'desktop',
  },
};

// addDecorator(withThemesProvider(FileSGThemes), ThemeProvider);
export const decorators = [(Story) => <ThemeProvider theme={FileSGThemes[0]}>{WithStyles(Story)}</ThemeProvider>];

const parameters = {
  decorators,
  controls: { expanded: true },
  layout: 'fullscreen',
  options: {
    method: 'alphabetical',
    storySort: {
      order: ['Foundations', ['Typography', 'Color Palette'], 'Components', ['Layout', 'Data Display', 'Inputs', 'Navigation']],
    },
  },
  viewport: {
    viewports: FILESG_VIEWPORTS,
  },
};

export default parameters;
