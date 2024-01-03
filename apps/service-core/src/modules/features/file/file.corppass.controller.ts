import {
  AllFileAssetsResponse,
  AllFileAssetUuidsResponse,
  ERROR_RESPONSE_DESC,
  FileHistoryDisplayResponse,
  FileQrCodeResponse,
  GenerateFilesDownloadTokenResponse,
  PaginationOptions,
  ViewableFileAssetResponse,
} from '@filesg/common';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import {
  AllFileAssetsFromCorporateRequestDto,
  AllFileAssetUuidsRequestDto,
  FileAssetHistoryRequestDto,
  GenerateFilesDownloadTokenRequest,
} from '../../../dtos/file/request';
import { RequestWithCorporateUserSession } from '../../../typings/common';
import { CorppassFileService } from './file.corppass.service';

@ApiTags('file')
@Controller('v1/file/corppass')
@UseInterceptors(ClassSerializerInterceptor)
export class CorppassFileController {
  private readonly logger = new Logger(CorppassFileController.name);

  constructor(private readonly corppassFileService: CorppassFileService) {}

  @Post('generate-download-token')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'File download token.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileToken(
    @Body() body: GenerateFilesDownloadTokenRequest,
    @Req() req: RequestWithCorporateUserSession,
  ): Promise<GenerateFilesDownloadTokenResponse> {
    const { uuids } = body;
    return this.corppassFileService.generateFileSessionAndJwtForDownload(uuids, req.session.user);
  }

  @Get('recent')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveRecentFileAssets(@Req() req: RequestWithCorporateUserSession, @Query() query: PaginationOptions) {
    const { user } = req.session;
    return this.corppassFileService.retrieveRecentFileAssets(user, query);
  }

  @Get('all-files')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssets(@Req() req: RequestWithCorporateUserSession, @Query() query: AllFileAssetsFromCorporateRequestDto) {
    const { user } = req.session;
    return this.corppassFileService.retrieveAllFileAssets(user, query);
  }

  @Get('all-files/list')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetUuidsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssetUuids(@Req() req: RequestWithCorporateUserSession, @Query() query: AllFileAssetUuidsRequestDto) {
    return this.corppassFileService.retrieveAllCorporateFileAssetUuids(req.session.user, query);
  }

  @Get(':fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset details.', type: ViewableFileAssetResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET })
  async retrieveFileAsset(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithCorporateUserSession) {
    const { user } = req.session;
    return this.corppassFileService.retrieveCorporateFileAsset(fileAssetUuid, user);
  }

  @Get('/:fileAssetUuid/generate-qr')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Generate QR code for verification.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateVerifyToken(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: RequestWithCorporateUserSession,
  ): Promise<FileQrCodeResponse> {
    const { user } = req.session;
    return this.corppassFileService.generateVerifyToken(fileAssetUuid, user);
  }

  @Post(':fileAssetUuid/lastViewedAt')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'No response' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLastViewedAt(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithCorporateUserSession) {
    return this.corppassFileService.updateCorppassLastViewedAt(fileAssetUuid, req.session.user);
  }

  @Get(':fileAssetUuid/history')
  @FileSGAuth({ auth_state: AUTH_STATE.CORPORATE_USER_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset history.', type: FileHistoryDisplayResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET_HISTORY })
  async retrieveFileHistory(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: RequestWithCorporateUserSession,
    @Query() query: FileAssetHistoryRequestDto,
  ) {
    return this.corppassFileService.retrieveFileHistory(fileAssetUuid, req.session.user, query);
  }
}
