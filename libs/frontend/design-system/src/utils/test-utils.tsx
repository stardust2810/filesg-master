import { render, RenderOptions, screen } from '@testing-library/react';
import React, { FC, ReactElement } from 'react';
import { ThemeProvider } from 'styled-components';

import { FileSGThemes } from '../styles/theme';

const AllTheProviders: FC = ({ children }) => {
  return <ThemeProvider theme={FileSGThemes[0]}>{children}</ThemeProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllTheProviders, ...options });

export function testIfComponentShouldRender(
  component: JSX.Element,
  isExpectedToRender: boolean,
  componentName: string,
  uiLocator: string,
  conditionDesc?: string,
) {
  it(`should${isExpectedToRender ? '' : ' NOT'} render ${componentName} ${conditionDesc ? 'when ' + conditionDesc : ''}`, () => {
    customRender(component);
    const content = screen.queryByTestId(uiLocator);

    isExpectedToRender ? expect(content).toBeInTheDocument() : expect(content).not.toBeInTheDocument();
  });
}
export * from '@testing-library/react';
export { customRender as render };
