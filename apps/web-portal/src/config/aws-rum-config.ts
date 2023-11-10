import { AwsRum, AwsRumConfig } from 'aws-rum-web';

import { config } from './app-config';

class AwsRumManager {
  private awsRum: AwsRum | undefined;

  public init() {
    const { awsRumConfig } = config;

    if (this.awsRum) {
      // eslint-disable-next-line no-console
      console.warn('AWS RUM has already been initialised');
      return;
    }

    if (
      !awsRumConfig.applicationId ||
      !awsRumConfig.applicationVersion ||
      !awsRumConfig.guestRoleArn ||
      !awsRumConfig.identityPoolId ||
      !awsRumConfig.endpoint
    ) {
      // will not initialise if there is no applicationId
      // eslint-disable-next-line no-console
      console.warn('AWS RUM did not intialise due to missing config');
      return;
    }

    try {
      const {
        applicationId,
        applicationVersion,
        applicationRegion,
        guestRoleArn,
        identityPoolId,
        endpoint,
        telemetries,
        allowCookies,
        enableXRay,
        sessionSampleRate,
      } = awsRumConfig;

      const config: AwsRumConfig = {
        sessionSampleRate,
        guestRoleArn,
        identityPoolId,
        endpoint,
        telemetries,
        allowCookies,
        enableXRay,
      };

      this.awsRum = new AwsRum(applicationId, applicationVersion, applicationRegion, config);
    } catch (error) {
      // Ignore errors thrown during Cloudwatch RUM web client initialisation
      // Nothing to handle when AWS RUM initialisation fail, except to print out the error msg
      // eslint-disable-next-line no-console
      console.warn(`AWS RUM initialisation error: ${(error as Error).message}`);
    }
  }

  public getAwsRum() {
    return this.awsRum;
  }
}

export const awsRumManager = new AwsRumManager();
