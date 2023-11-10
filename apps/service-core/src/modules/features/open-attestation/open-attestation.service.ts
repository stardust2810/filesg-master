import {
  CertificateRevocationResponse,
  CertificateVerificationResponse,
  COMPONENT_ERROR_CODE,
  FILE_STATUS,
  isExpiredByDate,
  OA_CERTIFICATE_STATUS,
  OaDocumentRevocationTypeMapper,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { isValid, openAttestationVerifiers, verificationBuilder, verify as defaultVerify } from '@govtechsg/oa-verify';
import { getData, v2, validateSchema } from '@govtechsg/open-attestation';
import { Issuer } from '@govtechsg/open-attestation/dist/types/__generated__/schema.2.0';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DIDCache, Resolver } from 'did-resolver';
import { providers } from 'ethers';
import { getResolver } from 'ethr-did-resolver';
import { MultiProviderConfiguration } from 'ethr-did-resolver/lib/configuration';

import { InvalidOaDocumentException } from '../../../common/filters/custom-exceptions.filter';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { OaCertificateEntityService } from '../../entities/oa-certificate/oa-certificate.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class OpenAttestationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OpenAttestationService.name);
  private verify: typeof defaultVerify;

  constructor(
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly redisService: RedisService,
    private readonly agencyService: AgencyEntityService,
    private readonly oaCertificateEntityService: OaCertificateEntityService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Initialise OA Verifier');
    this.initialiseVerifier();
  }

  // ===========================================================================
  // OA certificate revocation status verification
  // ===========================================================================
  public async verifyOaCertificateRevocationStatus(certificateIdentifier: string): Promise<CertificateRevocationResponse> {
    const oaCertificate = await this.oaCertificateEntityService.retrieveOaCertificateWithFileAssetExpiry(certificateIdentifier);

    // Check fileAsset expireAt field, in case cron job hasn't expired the document
    const { expireAt, status } = oaCertificate.fileAssets![0];
    const isFileAssetExpired = status !== FILE_STATUS.EXPIRED && !!expireAt && isExpiredByDate(expireAt);

    if (isFileAssetExpired) {
      return { revoked: true, documentHash: oaCertificate.hash, reasonCode: OaDocumentRevocationTypeMapper['expired'] };
    }

    if (oaCertificate.status === OA_CERTIFICATE_STATUS.REVOKED) {
      return { revoked: true, documentHash: oaCertificate.hash, reasonCode: OaDocumentRevocationTypeMapper[oaCertificate.revocationType!] };
    }

    return { revoked: false, documentHash: oaCertificate.hash };
  }

  // =============================================================================
  // OA Verification
  // =============================================================================
  public async verifyIdentityProofLocation(location: string) {
    return await this.agencyService.isAgencyExistByIdentityProofLocation(location);
  }

  public async verifyOADocumentInBase64(oaDocumentInBase64: string): Promise<{
    oaDocument: v2.SignedWrappedDocument<v2.OpenAttestationDocument>;
    verificationResult: CertificateVerificationResponse;
  }> {
    let oaDocument: v2.SignedWrappedDocument<v2.OpenAttestationDocument>;

    try {
      const buffer = Buffer.from(oaDocumentInBase64, 'base64');
      oaDocument = JSON.parse(buffer.toString());
    } catch (error) {
      this.logger.error(`Failed to parse oa document input. Error: ${(error as Error).message}`);
      throw new InvalidOaDocumentException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE);
    }

    const verificationResult = await this.verifyOADocument(oaDocument);
    return { oaDocument, verificationResult };
  }

  public async verifyOADocument(document: v2.SignedWrappedDocument<v2.OpenAttestationDocument>): Promise<CertificateVerificationResponse> {
    const isValidOASchema = validateSchema(document);

    if (!isValidOASchema) {
      const internalLog = 'OA document schema is invalid';
      throw new InvalidOaDocumentException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, internalLog);
    }

    const { issuers } = getData(document);

    if (issuers.length !== 1 || !(await this.isIssuerValid(issuers[0]))) {
      const internalLog = `Issuers: ${issuers} not in whitelisted domains`;
      throw new InvalidOaDocumentException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, internalLog);
    }

    const fragments = await this.verify(document);

    return { isValid: isValid(fragments), fragments };
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  protected async isIssuerValid(issuer: Issuer): Promise<boolean> {
    const { identityProof } = issuer;

    if (!identityProof?.location || !identityProof.key) {
      this.logger.log(`Is not valid as identityProof?.location: ${identityProof?.location} identityProof.key${identityProof?.key}`);
      return false;
    }

    return await this.verifyIdentityProofLocation(identityProof.location);
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private customCache: DIDCache = async (parsed, resolve) => {
    const {
      oaConfig: { oaDidResolutionCacheExpirySeconds },
    } = this.fileSGConfigService;

    if (parsed.params && parsed.params['no-cache'] === 'true') {
      return await resolve();
    }

    const cachedResult = await this.redisService.get(FILESG_REDIS_CLIENT.OA_DID_RESOLUTION, parsed.didUrl);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const doc = await resolve();

    await this.redisService.set(
      FILESG_REDIS_CLIENT.OA_DID_RESOLUTION,
      parsed.didUrl,
      JSON.stringify(doc),
      undefined,
      oaDidResolutionCacheExpirySeconds,
    );

    return doc;
  };

  private initialiseVerifier = () => {
    const {
      systemConfig: { infuraApiKey, alchemyApiKey, ethNetworkName },
    } = this.fileSGConfigService;

    const NETWORK_NAME = ethNetworkName || 'goerli';

    if (!this.verify) {
      const config: { providers: providers.FallbackProviderConfig[]; resolvers: MultiProviderConfiguration } = {
        providers: [],
        resolvers: { networks: [] },
      };

      /**
       * 1. Infura - Provider Priority: 1, Resolver Index: 1
       * 2. Alchemy - Provider Priority: 2, Resolver Index: 0
       *
       * Provider: Lower-value priorities are favoured: https://docs.ethers.io/v5/api/providers/other/#FallbackProviderConfig
       * Resolver: Infura resolver should be last item in array so that it will be used first
       */
      if (infuraApiKey) {
        const infuraProvider = new providers.InfuraProvider(NETWORK_NAME, infuraApiKey);
        config.providers.push({ provider: infuraProvider, priority: 1, stallTimeout: 4000 });
        config.resolvers.networks!.unshift({ name: 'goerli', provider: infuraProvider });
        config.resolvers.networks!.unshift({ name: 'mainnet', provider: infuraProvider });
      }

      if (alchemyApiKey) {
        const alchemyProvider = new providers.AlchemyProvider(NETWORK_NAME, alchemyApiKey);
        config.providers.push({ provider: alchemyProvider, priority: 2 });
        config.resolvers.networks!.unshift({ name: 'goerli', provider: alchemyProvider });
        config.resolvers.networks!.unshift({ name: 'mainnet', provider: alchemyProvider });
      }

      const provider = config.providers.length > 0 ? new providers.FallbackProvider(config.providers) : undefined;
      const resolver =
        config.resolvers.networks!.length > 0 ? new Resolver(getResolver(config.resolvers), { cache: this.customCache }) : undefined;

      /**
       *
       * 0: DOCUMENT_INTEGRITY - /documentIntegrity/hash/openAttestationHash.type
       * 1: DOCUMENT_STATUS - /documentStatus/tokenRegistry/ethereumTokenRegistryStatus.type
       * 2: DOCUMENT_STATUS - /documentStatus/documentStore/ethereumDocumentStoreStatus.type
       * 3: DOCUMENT_STATUS - /documentStatus/didSigned/didSignedDocumentStatus.type
       * 4: ISSUER_IDENTITY - /issuerIdentity/dnsTxt/openAttestationDnsTxt.type
       * 5: ISSUER_IDENTITY - /issuerIdentity/dnsDid/dnsDidProof.type
       *
       *  */
      this.verify = verificationBuilder([...openAttestationVerifiers], {
        provider,
        resolver,
        network: NETWORK_NAME,
      });
    }
  };
}
