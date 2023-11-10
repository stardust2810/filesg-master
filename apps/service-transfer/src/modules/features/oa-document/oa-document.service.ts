import { Readable } from 'node:stream';

import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { OASchemaValidationException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FileUploadAgencyInfo, OA_TYPE } from '@filesg/common';
import {
  obfuscateDocument,
  signDocument,
  SignedWrappedDocument,
  SUPPORTED_SIGNING_ALGORITHM,
  wrapDocument,
} from '@govtechsg/open-attestation';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Ajv from 'ajv';
import { Wallet } from 'ethers';

import { AgencyOATypeMismatchException } from '../../../common/custom-exceptions';
import { FileDownloadErrorException } from '../../../common/filters/custom-exceptions.filter';
import { RawDocument } from '../../../typings/common';
import { FileSGConfigService } from '../../setups/config/config.service';
import { S3Service } from '../aws/s3.service';
import { OaFactory } from './oa-generator.factory';

@Injectable()
export class OaDocumentService {
  private readonly logger = new Logger(OaDocumentService.name);

  constructor(
    private fileSgConfigServce: FileSGConfigService,
    private awsS3Service: S3Service,
    private oaFactory: OaFactory,
    @Inject('Ajv') private ajv: Ajv,
  ) {}

  public async createOADocument(oaType: OA_TYPE, oaData: any, agencyInfo: FileUploadAgencyInfo) {
    const { name: agencyName, code: agencyCode, identityProofLocation, sk: signingKey } = agencyInfo;

    await this.verifyDataAgainstSchema(agencyCode, oaType, oaData);

    this.logger.log('OA JSON data is valid proceeding to generate raw document');
    const wallet = new Wallet(signingKey);

    const rawDocument = this.oaFactory.generateOa(oaType, oaData, agencyName, identityProofLocation, wallet.address);

    this.logger.log('Raw document generated. Proceeding to generate wrapped document');
    const wrappedDocument = wrapDocument(rawDocument);

    this.logger.log('Wrapped document generated. Proceeding to sign wrapped document');
    const signedDocument = await signDocument(wrappedDocument, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, wallet);

    this.logger.log('Signed document generated and returning signed document');
    return { signedDocument, oaCertificateId: rawDocument.id };
  }

  private async getAgencyOASchema(agency: string, oaType: OA_TYPE) {
    let downloadedOASchema: GetObjectCommandOutput;
    try {
      downloadedOASchema = await this.awsS3Service.downloadFileFromStaticFileBucket(
        `${this.fileSgConfigServce.awsConfig.agencyOASchemaFolderName}/${agency}_${oaType}.json`,
      );
    } catch (error) {
      throw new AgencyOATypeMismatchException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, agency, oaType);
    }

    let documentSchemaChunk = '';

    if (!downloadedOASchema.Body) {
      this.logger.warn(`Agency schema File data missing from s3 ${agency}_${oaType}.json`);
      throw new FileDownloadErrorException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE);
    }

    for await (const chunk of downloadedOASchema.Body as Readable) {
      documentSchemaChunk += chunk;
    }

    const documentSchema = JSON.parse(documentSchemaChunk);

    if (!documentSchema.schema) {
      this.logger.warn('Missing schema for specified OA type');
      throw new FileDownloadErrorException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE);
    }

    return documentSchema;
  }

  private async verifyDataAgainstSchema(agencyCode: string, oaType: OA_TYPE, oaData: any): Promise<void> {
    /**
     * Find or add schema to avoid possible memory leak issue due to the use of Map by ajv library as their cache.
     * When using the same ajv instance throughout the app lifetime, memory leak occurs when compilation of schema is done, the Map cache
     * keeps growing because of compilation of schema of different object instance.
     * Even though the schemas are the same in serialized form, they are actually differentobject.
     * Hence, every compilation creates a new entry in the Map thus causing memory leak.
     */
    const schemaName = `${agencyCode}_${oaType}`;
    let validate = this.ajv.getSchema(schemaName);

    if (!validate) {
      const documentSchema = await this.getAgencyOASchema(agencyCode, oaType);
      this.ajv.addSchema(documentSchema.schema, schemaName);
      validate = this.ajv.getSchema(schemaName);
    }

    const valid = validate!(oaData);

    if (!valid) {
      throw new OASchemaValidationException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, validate!.errors);
    }
  }

  public obfuscateOa(oaDocument: SignedWrappedDocument<RawDocument>, keysToObfuscate: string[]) {
    return obfuscateDocument(oaDocument, keysToObfuscate);
  }
}
