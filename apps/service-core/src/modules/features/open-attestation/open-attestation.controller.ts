import { CertificateRevocationResponse, CertificateVerificationResponse, ERROR_RESPONSE_DESC, VerifyOaRequest } from '@filesg/common';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { OpenAttestationService } from './open-attestation.service';

/**
 * All the endpoints except GET are excluded from the global prefix (core) so that
 * they are not exposed to the Internet
 */
@ApiTags('open-attestation')
@Controller('v1/open-attestation')
export class OpenAttestationController {
  private readonly logger = new Logger(OpenAttestationController.name);

  constructor(private readonly openAttestationService: OpenAttestationService) {}

  /**
   * Changed this from certificate identifier to cater for both cert id and hash.
   * As the oa-verify library's verify function with first call with cert hash then cert id,
   * to prevent backend logging 400 error when calling with cert id (previous approach) which causes it to be show in grafarna,
   * updated to call with cert hash instead (but still this endpoint is flexible to accept both hash and id)
   */
  @Get('revocation-status/:certificateIdentifier')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({ type: CertificateRevocationResponse, description: 'Retrieves certificate revocation status.' })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_CERTIFICATE })
  async retrieveCertificateRevocation(@Param('certificateIdentifier') certificateIdentifier: string) {
    this.logger.log(`Retrieving revocation of certificate with identifier of ${certificateIdentifier}`);
    return await this.openAttestationService.verifyOaCertificateRevocationStatus(certificateIdentifier);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({ type: CertificateVerificationResponse, description: 'Verify OA validity.' })
  async verify(@Body() body: VerifyOaRequest) {
    return (await this.openAttestationService.verifyOADocumentInBase64(body.oaDocument)).verificationResult;
  }
}
