import { SnsService as BaseSnsService } from '@filesg/aws';
import { DATE_FORMAT_PATTERNS } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';

@Injectable()
export class SnsService {
  private readonly logger = new Logger(SnsService.name);

  constructor(private readonly baseSnsService: BaseSnsService) {}

  public async sendOtpSms(phoneNumber: string, otp: string, expireAt: Date) {
    const expireTime = format(expireAt, DATE_FORMAT_PATTERNS.TIME);
    const otpMessage = `Please do not reply to this auto-generated message. FileSG will never ask you to share your OTP. Your OTP is ${otp}. This OTP expires at ${expireTime} SG Time.`;

    return await this.baseSnsService.sendSms(otpMessage, phoneNumber);
  }
}
