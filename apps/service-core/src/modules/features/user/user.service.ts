import { InputValidationException, LogMethod } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FEATURE_TOGGLE, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { transformBasicAgencies } from '../../../common/transformers/agency.transformer';
import { transformDetailUser } from '../../../common/transformers/user.transformer';
import { RequestWithCitizenSession } from '../../../typings/common';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userEntityService: UserEntityService,
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly agencyEntityService: AgencyEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
  ) {}

  @LogMethod()
  public async retrieveUserDetail(uuid: string) {
    return transformDetailUser(await this.userEntityService.retrieveUserByUuid(uuid));
  }

  @LogMethod()
  public async checkDuplicateEmail(email: string) {
    const user = await this.userEntityService.retrieveUserByEmail(email, { toThrow: false });
    return { isDuplicate: user ? true : false };
  }

  public async onboardCitizenUser(req: RequestWithCitizenSession) {
    const userId = req.session.user.userId;

    const citizenUser = await this.citizenUserEntityService.retrieveCitizenUserById(userId);
    if (!citizenUser.email || !citizenUser.phoneNumber) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.CITIZEN_USER_SERVICE, 'Unable to onboard user without email or phone number');
    }

    await this.citizenUserEntityService.updateCitizenUserById(userId, { isOnboarded: true });
    req.session.user.isOnboarded = true;

    if (this.fileSGConfigService.systemConfig.toggleOnboardingReset === FEATURE_TOGGLE.ON) {
      this.logger.log(`Onboarding reset feature is turned on`);
      await this.citizenUserEntityService.updateCitizenUserById(userId, { isOnboarded: false, email: null, phoneNumber: null });
      req.session.user.isOnboarded = false;
    }
  }

  public async getAgencyList(req: RequestWithCitizenSession) {
    const { userId } = req.session.user;

    const agencies = await this.agencyEntityService.retrieveIssuingAgenciesWithStatusesByUserId(userId, VIEWABLE_FILE_STATUSES);
    return transformBasicAgencies(agencies);
  }
}
