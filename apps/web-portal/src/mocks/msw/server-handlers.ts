import { rest } from 'msw';

/**
 * If there is a need to mock test file generic request's response, put it here
 */
const catchOthersHandler = rest.get('*', (req, res, ctx) => {
  // eslint-disable-next-line no-console
  console.warn(`Please add request handler for ${req.url.toString()}`);
  return res(ctx.status(500), ctx.json({ error: 'Please add request handler' }));
});

export const handlers = [catchOthersHandler];
