import { rest, RestHandler } from 'msw';

import { MOCK_PHOTO_FROM_CIRIS, MOCK_TOKEN_FROM_CIRIS } from '../../../consts/mocks';
import { MyIcaDoLoginRequest } from '../../../dtos/agency-client/request';
import { MCC_STATUS_CODE } from '../../../typings/common';
import { FileSGConfigService } from '../config/config.service';

/**
 * The URL has to be absolute URL
 *
 * Do remember to remove when not in use
 */
export const thirdPartyApiMockHandlers = (filesgConfigService: FileSGConfigService): RestHandler[] => {
  const { agencyConfig, apexConfig } = filesgConfigService;

  return [
    // apex cloud CIRIS retrieve token
    rest.post(apexConfig.apexIntranetUrl + '/ica/ica/PostmanSvc/mmbs/webservice/services/biometrics/authenticate', (req, res, ctx) => {
      return res(ctx.json(MOCK_TOKEN_FROM_CIRIS));
    }),
    // apex cloud CIRIS retrieve photo
    rest.post(
      apexConfig.apexIntranetUrl + '/ica/ica/PostmanSvc/mmbs/webservice/services/biometrics/getLatestRegistrationListJSAction',
      (req, res, ctx) => {
        return res(ctx.json(MOCK_PHOTO_FROM_CIRIS));
      },
    ),

    // MyICA DoLogin API
    rest.post<MyIcaDoLoginRequest>(agencyConfig.myIcaDologinUrl, (req, res, ctx) => {
      return res(ctx.json({ header: { singpassID: 'S3002610A' } }));
    }),

    // MCC API
    rest.post(agencyConfig.mccApiUrl, (req, res, ctx) => {
      return res(
        ctx.json({
          retrievalStatus: MCC_STATUS_CODE['MYINFO RETRIEVAL SUCCESSFUL'],
          personalInfo: { personSurname: 'Chan', personName: 'Joey' },
          contactInfo: { contactMobileNo: '+|65|97399245', contactEmailAddr: 'test-email@msw-mock.fsg' },
        }),
      );
    }),
  ];
};
