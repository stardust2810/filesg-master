import { SnsService as BaseSnsService } from '@filesg/aws';
import { DATE_FORMAT_PATTERNS } from '@filesg/common';
import { format } from 'date-fns';

import { MockService } from '../../../../typings/common.mock';
import { SnsService } from '../sns.service';

export const mockBaseSnsService: MockService<BaseSnsService> = {
  sendSms: jest.fn(),
};

export const mockSnsService: MockService<SnsService> = { sendOtpSms: jest.fn() };

export const mockPhoneNumber = 'mockPhoneNumber';
export const mockOtp = 'mockOtp';
export const mockExpiryDate = new Date(1234);
export const mockExpiryTime = format(mockExpiryDate, DATE_FORMAT_PATTERNS.TIME);
