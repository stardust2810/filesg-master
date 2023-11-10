import { AllFileAssetsResponse } from '@filesg/common';
import { rest } from 'msw';

import { mswServer } from '../../../mocks/msw/server';
import { renderComponent } from '../../../utils/testing/test-utils';
import Files from '.';

const fileAssetsResponse: AllFileAssetsResponse = { items: [], count: 10, next: 1 };

const allFilesHandler = rest.get(`/core/file/agency/all-files`, async (req, res, ctx) => {
  return res(ctx.json(fileAssetsResponse));
});

const handlers = [allFilesHandler];

describe('Page: Documents', () => {
  it('display returned files on successful fetch', async () => {
    renderComponent(<Files />, {});
    mswServer.use(...handlers);
  });
});
