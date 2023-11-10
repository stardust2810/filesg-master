import { SnsService as BaseSnsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockBaseSnsService, mockExpiryDate, mockExpiryTime, mockOtp, mockPhoneNumber } from '../__mocks__/sns.service.mock';
import { SnsService } from '../sns.service';

describe('SnsService', () => {
  let service: SnsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnsService,
        {
          provide: BaseSnsService,
          useValue: mockBaseSnsService,
        },
      ],
    }).compile();

    service = module.get<SnsService>(SnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtpSms', () => {
    it('should be defined', () => {
      expect(service.sendOtpSms).toBeDefined();
    });

    it('should call baseSnsService sendSms with correct args', () => {
      service.sendOtpSms(mockPhoneNumber, mockOtp, mockExpiryDate);

      const mockOtpMessage = `Please do not reply to this auto-generated message. FileSG will never ask you to share your OTP. Your OTP is ${mockOtp}. This OTP expires at ${mockExpiryTime} SG Time.`;

      expect(mockBaseSnsService.sendSms).toBeCalledWith(mockOtpMessage, mockPhoneNumber);
    });
  });
});
