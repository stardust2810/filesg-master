import 'multer'; // To ensure that Express.Multer is present

import {
  AllFileAssetsResponse,
  AllFileAssetUuidsResponse,
  ERROR_RESPONSE_DESC,
  ErrorResponse,
  FileHistoryDisplayResponse,
  FileQrCodeResponse,
  ROLE,
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { JwtNonSingpassContentRetrievalAuthGuard } from '../../../common/guards/jwt-non-singpass-content-retrieval.guard';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { SWAGGER_AUTH_NAME } from '../../../consts';
import {
  AllFileAssetsFromAgencyRequestDto,
  AllFileAssetsFromCitizenRequestDto,
  AllFileAssetUuidsRequestDto as AllFileAssetUuidsRequestDto,
  FileAssetAccessToken,
  FileAssetHistoryRequestDto,
  FileDownloadRequest,
} from '../../../dtos/file/request';
import { NonSingpassContentRetrievalRequest, RequestWithSession } from '../../../typings/common';
import { FileService } from './file.service';

@ApiTags('file')
@Controller('v1/file')
@UseInterceptors(ClassSerializerInterceptor)
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Get('download')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Downloads file.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileToken(@Query() query: FileDownloadRequest, @Req() req: RequestWithSession): Promise<string> {
    const { uuid } = query;
    this.logger.log(`File Uuids: ${uuid.join(', ')}`);

    const userUuid = req.session.user.userUuid;
    return await this.fileService.generateFileSessionAndJwtForDownload(uuid, userUuid);
  }

  @Get('/non-singpass/download')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ type: String, description: 'Downloads file.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileTokenForNonSingpass(
    @Query() query: FileDownloadRequest,
    @Req() req: NonSingpassContentRetrievalRequest,
  ): Promise<string> {
    const { uuid } = query;
    const { activityUuid, userUuid } = req.user;
    this.logger.log(`File Uuids: ${uuid.join(', ')}`);
    return await this.fileService.generateFileSessionAndJwtForDownload(uuid, userUuid, activityUuid);
  }

  @Post('/verify/download')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Return a jwt token to to allow user to download file.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileTokenForVerify(@Body() { token }: FileAssetAccessToken): Promise<string> {
    return await this.fileService.verifyAccessTokenAndFileSessionAndJwtForDownload(token);
  }

  @Get('/agency/all-files')
  @ApiTags('apigw', 'tech-doc:get all files')
  @ApiOperation({
    summary: 'get all files.',
    description: 'This API endpoint retrieves all files associated with a user and issued under the requesting agency.',
  })
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_READ] })
  @ApiOkResponse({ description: 'All active files issued by requesting agency.', type: AllFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssetsFromAgency(@Req() req: RequestWithSession, @Query() query: AllFileAssetsFromAgencyRequestDto) {
    const { userId } = req.session.user;
    return await this.fileService.retrieveAllFileAssetsFromAgency(userId, query);
  }

  @Get('all-files')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssets(@Req() req: RequestWithSession, @Query() query: AllFileAssetsFromCitizenRequestDto) {
    const { userId } = req.session.user;
    return await this.fileService.retrieveAllFileAssets(userId, query);
  }

  @Get('all-files/list')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetUuidsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssetUuids(@Req() req: RequestWithSession, @Query() query: AllFileAssetUuidsRequestDto) {
    const { userUuid } = req.session.user;
    return await this.fileService.retrieveAllFileAssetUuids(userUuid, query);
  }

  @Get('non-singpass/:fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ description: 'File asset details.', type: ViewableFileAssetResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET })
  async retrieveNonSingpassFileAsset(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: NonSingpassContentRetrievalRequest) {
    const { userId, activityUuid } = req.user;
    return await this.fileService.retrieveNonSingpassFileAsset(fileAssetUuid, userId, activityUuid);
  }

  @Get('history/:fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset history.', type: FileHistoryDisplayResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET_HISTORY })
  async retrieveFileHistory(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: RequestWithSession,
    @Query() query: FileAssetHistoryRequestDto,
  ) {
    return this.fileService.retrieveFileHistory(fileAssetUuid, req.session.user.userId, query);
  }

  @Get('non-singpass/history/:fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ description: 'File asset history.', type: FileHistoryDisplayResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET_HISTORY })
  async retrieveNonSingpassFileHistory(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: NonSingpassContentRetrievalRequest,
    @Query() query: FileAssetHistoryRequestDto,
  ) {
    return await this.fileService.retrieveNonSingpassFileHistory(fileAssetUuid, req.user.userId, query, req.user.activityUuid);
  }

  @Post('update/:fileAssetUuid/lastViewedAt')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'No response' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async updateLastViewedAt(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithSession) {
    const { userId } = req.session.user;
    return this.fileService.updateLastViewedAt(fileAssetUuid, userId);
  }

  @Post('non-singpass/update/:fileAssetUuid/lastViewedAt')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ description: 'No response' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  async updateNonSingpassLastViewedAt(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: NonSingpassContentRetrievalRequest) {
    const { userId, activityUuid } = req.user;
    return this.fileService.updateLastViewedAt(fileAssetUuid, userId, activityUuid);
  }

  @Get(':fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset details.', type: ViewableFileAssetResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET })
  async retrieveFileAsset(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithSession) {
    return await this.fileService.retrieveFileAsset(fileAssetUuid, req.session.user.userId);
  }

  @Get('/:fileAssetUuid/generate-qr')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Generate QR code for verification.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateVerifyToken(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithSession): Promise<FileQrCodeResponse> {
    const { userUuid } = req.session.user;

    return await this.fileService.generateVerifyToken(fileAssetUuid, userUuid);
  }

  @Get('/:fileAssetUuid/non-singpass/generate-qr')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ type: String, description: 'Generate QR code for verification.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateVerifyTokenForNonSingpass(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: NonSingpassContentRetrievalRequest,
  ): Promise<FileQrCodeResponse> {
    const { userUuid } = req.user;

    return await this.fileService.generateVerifyToken(fileAssetUuid, userUuid);
  }
}
