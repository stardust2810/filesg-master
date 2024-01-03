import 'multer'; // To ensure that Express.Multer is present

import { EserviceFileDownloadRequest } from '@filesg/backend-common';
import {
  AllFileAssetsResponse,
  AllFileAssetUuidsResponse,
  AllRecentFileAssetsResponse,
  ERROR_RESPONSE_DESC,
  ErrorResponse,
  FileHistoryDisplayResponse,
  FileQrCodeResponse,
  GenerateFilesDownloadTokenForAgencyResponse,
  GenerateFilesDownloadTokenResponse,
  PaginationOptions,
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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AUTH_STATE, FileSGAuth } from '../../../common/decorators/filesg-auth.decorator';
import { JwtNonSingpassContentRetrievalAuthGuard } from '../../../common/guards/jwt-non-singpass-content-retrieval.guard';
import { AppendTraceIdInterceptor } from '../../../common/interceptors/append-trace-id.interceptor';
import { SWAGGER_AUTH_NAME } from '../../../consts';
import {
  AllFileAssetsFromAgencyRequestDto,
  AllFileAssetsFromCitizenRequestDto,
  AllFileAssetUuidsRequestDto,
  FileAssetAccessToken,
  FileAssetHistoryRequestDto,
  GenerateFilesDownloadTokenRequest,
} from '../../../dtos/file/request';
import { NonSingpassContentRetrievalRequest, RequestWithCitizenSession } from '../../../typings/common';
import { FileService } from './file.service';

@ApiTags('file')
@Controller('v1/file')
@UseInterceptors(ClassSerializerInterceptor)
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('generate-download-token')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'File download token.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileToken(
    @Body() body: GenerateFilesDownloadTokenRequest,
    @Req() req: RequestWithCitizenSession,
  ): Promise<GenerateFilesDownloadTokenResponse> {
    const { uuids } = body;
    this.logger.log(`File Uuids: ${uuids}`);

    const userUuid = req.session.user.userUuid;
    return await this.fileService.generateFileSessionAndJwtForDownload(uuids, userUuid);
  }

  @Post('/non-singpass/generate-download-token')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ type: String, description: 'File download token.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileTokenForNonSingpass(
    @Body() body: GenerateFilesDownloadTokenRequest,
    @Req() req: NonSingpassContentRetrievalRequest,
  ): Promise<GenerateFilesDownloadTokenResponse> {
    const { uuids } = body;
    const { activityUuid, userUuid } = req.user;
    this.logger.log(`File Uuids: ${uuids}`);
    return await this.fileService.generateFileSessionAndJwtForDownload(uuids, userUuid, activityUuid);
  }

  @Post('/verify/download')
  @FileSGAuth({ auth_state: AUTH_STATE.NO_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Return a jwt token to to allow user to download file.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateDownloadFileTokenForVerify(@Body() { token }: FileAssetAccessToken): Promise<GenerateFilesDownloadTokenResponse> {
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
  async retrieveAllFileAssetsFromAgency(@Req() req: RequestWithCitizenSession, @Query() query: AllFileAssetsFromAgencyRequestDto) {
    const { userId } = req.session.user;
    return await this.fileService.retrieveAllFileAssetsFromAgency(userId, query);
  }

  @Get('recent')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'All recently viewed active files.', type: AllRecentFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveRecentFileAssets(@Req() req: RequestWithCitizenSession, @Query() query: PaginationOptions) {
    const { userId } = req.session.user;
    return await this.fileService.retrieveRecentFileAssets(userId, query);
  }

  @Get('all-files')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssets(@Req() req: RequestWithCitizenSession, @Query() query: AllFileAssetsFromCitizenRequestDto) {
    const { userId } = req.session.user;
    return await this.fileService.retrieveAllFileAssets(userId, query);
  }

  @Get('all-files/list')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'All active files.', type: AllFileAssetUuidsResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.OK)
  async retrieveAllFileAssetUuids(@Req() req: RequestWithCitizenSession, @Query() query: AllFileAssetUuidsRequestDto) {
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

  @Get(':fileAssetUuid/history')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset history.', type: FileHistoryDisplayResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET_HISTORY })
  async retrieveFileHistory(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: RequestWithCitizenSession,
    @Query() query: FileAssetHistoryRequestDto,
  ) {
    return this.fileService.retrieveFileHistory(fileAssetUuid, req.session.user.userId, query);
  }

  @Get('non-singpass/:fileAssetUuid/history')
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

  @Post(':fileAssetUuid/lastViewedAt')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'No response' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLastViewedAt(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithCitizenSession) {
    const { userId } = req.session.user;
    return this.fileService.updateLastViewedAt(fileAssetUuid, userId);
  }

  @Post('non-singpass/:fileAssetUuid/lastViewedAt')
  @FileSGAuth({ auth_state: AUTH_STATE.JWT })
  @UseGuards(JwtNonSingpassContentRetrievalAuthGuard)
  @ApiBearerAuth(SWAGGER_AUTH_NAME.BEARER_AUTH_NON_SINGPASS_CONTENT_RETRIEVAL)
  @ApiOkResponse({ description: 'No response' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNonSingpassLastViewedAt(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: NonSingpassContentRetrievalRequest) {
    const { userId, activityUuid } = req.user;
    return this.fileService.updateLastViewedAt(fileAssetUuid, userId, activityUuid);
  }

  @Get(':fileAssetUuid')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ description: 'File asset details.', type: ViewableFileAssetResponse })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiNotFoundResponse({ description: ERROR_RESPONSE_DESC.NOT_FOUND_FILE_ASSET })
  async retrieveFileAsset(@Param('fileAssetUuid') fileAssetUuid: string, @Req() req: RequestWithCitizenSession) {
    return await this.fileService.retrieveFileAsset(fileAssetUuid, req.session.user.userId);
  }

  @Get('/:fileAssetUuid/generate-qr')
  @FileSGAuth({ auth_state: AUTH_STATE.CITIZEN_LOGGED_IN })
  @ApiOkResponse({ type: String, description: 'Generate QR code for verification.' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  async generateVerifyToken(
    @Param('fileAssetUuid') fileAssetUuid: string,
    @Req() req: RequestWithCitizenSession,
  ): Promise<FileQrCodeResponse> {
    const { userUuid } = req.session.user;

    return await this.fileService.generateVerifyToken(fileAssetUuid, userUuid);
  }

  @Get('non-singpass/:fileAssetUuid/generate-qr')
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

  @Post('/agency/generate-download-token')
  @ApiTags('apigw', 'tech-doc:download file')
  @ApiOperation({
    summary: 'generate download token',
    description:
      'Authorized users can utilize this API to generate JSON Web Tokens (JWTs) that grant access to file downloading from their respective agency folders or the recipient folder.',
  })
  @FileSGAuth({ auth_state: AUTH_STATE.PROGRAMMATIC_LOGGED_IN, roles: [ROLE.PROGRAMMATIC_WRITE] })
  @ApiOkResponse({
    type: GenerateFilesDownloadTokenForAgencyResponse,
    description:
      'The Bearer token returned from this API is to be provided in the Authorization header when calling the Download File API.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.UNAUTHORISED })
  @ApiForbiddenResponse({ description: ERROR_RESPONSE_DESC.FORBIDDEN_CLIENT_ONLY, type: ErrorResponse })
  @UseInterceptors(AppendTraceIdInterceptor)
  @HttpCode(HttpStatus.OK)
  async generateFileDownloadTokenForEservice(
    @Body() { fileAssetUuids, userUin }: EserviceFileDownloadRequest,
    @Req() req: RequestWithCitizenSession,
  ) {
    const { userUuid: eserviceUserUuid } = req.session.user;
    return await this.fileService.generateFileDownloadTokenForAgency(eserviceUserUuid, fileAssetUuids, userUin);
  }
}
