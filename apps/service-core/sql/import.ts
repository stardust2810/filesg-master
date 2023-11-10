/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: `${path.resolve(__dirname, '../.env')}` });
import { DescribeDBInstancesCommand, DescribeDBInstancesCommandInput, RDSClient } from '@aws-sdk/client-rds';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { Signer } from '@aws-sdk/rds-signer';
import { Command } from 'commander';
import fs from 'fs/promises';
import * as _ from 'lodash';
import { Connection, ConnectionOptions, createConnection } from 'mysql2/promise';

// =============================================================================
// Utils
// =============================================================================
const getValueFromEnv = (key: string, defaultValue: string, disableWarrning = false) => {
  const value = process.env[key] || defaultValue;
  if ((_.isNil(value) || value.length === 0) && !disableWarrning) {
    console.warn(`Configuration key not found or empty: ${key}`);
  }
  return value;
};

const getRdsUsername = async () => {
  const client = new STSClient({ region: AWS_REGION });
  const command = new GetCallerIdentityCommand({});
  const { Arn } = await client.send(command);

  if (!Arn) {
    throw new Error('Failed to get AWS username');
  }

  return Arn.split('/').pop()!;
};

const getRdsAddress = async (id: string) => {
  const client = new RDSClient({ region: AWS_REGION });

  const input: DescribeDBInstancesCommandInput = {
    DBInstanceIdentifier: id,
  };

  const command = new DescribeDBInstancesCommand(input);
  const { DBInstances } = await client.send(command);

  if (!DBInstances?.[0].Endpoint?.Address) {
    throw new Error('Failed to get AWS db instances');
  }

  return DBInstances[0].Endpoint.Address;
};

// =============================================================================
// Setting up commandline options
// =============================================================================
const program = new Command();
program.option('-e, --environment <environment>', 'the environment of the rds to be connected to (e.g. local | dev | stg | uat)', 'local');
program.parse();

// =============================================================================
// Consts
// =============================================================================
const AWS_REGION = getValueFromEnv('AWS_REGION', 'ap-southeast-1');
const RECORDS_PATH = path.resolve(__dirname, 'records');
const RDS_ENVIRONMENT = program.opts().environment;
const RDS_IDENTIFIER = `rds-mysql-fsg2-${RDS_ENVIRONMENT}ezdb-core`;
const IS_LOCAL = RDS_ENVIRONMENT === 'local';

let connection: Connection;

/**
 * For local rds, make sure the .env is for local as this script will be reading from .env for values
 *
 * Run this script by:
 * 1. export your aws profile
 * 2. $ npx ts-node apps/service-core/sql/import.ts -e uat
 */
const main = async () => {
  try {
    const rdsConnectionOptions: ConnectionOptions = {
      host: 'localhost',
      database: getValueFromEnv('DB_NAME', 'core'),
    };

    if (IS_LOCAL) {
      rdsConnectionOptions.port = parseInt(getValueFromEnv('DB_PORT', '3306'));
      rdsConnectionOptions.user = getValueFromEnv('DB_USERNAME', 'admin');
      rdsConnectionOptions.password = getValueFromEnv('DB_PASSWORD', 'Abcd1234.');
    } else {
      console.log('Retrieving RDS address and username');
      const rdsAddress = await getRdsAddress(RDS_IDENTIFIER);
      const rdsUsername = await getRdsUsername();

      const signer = new Signer({
        /**
         * Required. The hostname of the database to connect to.
         */
        hostname: rdsAddress,
        /**
         * Required. The port number the database is listening on.
         */
        port: 3306,
        /**
         * Required. The username to login as.
         */
        username: rdsUsername,
        /**
         * Optional. The region the database is located in. Uses the region inferred from the runtime if omitted.
         */
        region: AWS_REGION,
      });

      console.log('Retrieving auth token');
      const token = await signer.getAuthToken();

      rdsConnectionOptions.port = 3307;
      rdsConnectionOptions.user = rdsUsername;
      rdsConnectionOptions.password = token;
      rdsConnectionOptions.ssl = 'Amazon RDS';
      rdsConnectionOptions.authPlugins = {
        mysql_clear_password: () => () => {
          return Buffer.from(token + '\0');
        },
      };
    }

    console.log('Creating RDS connection');
    connection = await createConnection(rdsConnectionOptions);
    console.log('Connected to RDS');

    const importData = async () => {
      const files = await fs.readdir(RECORDS_PATH);

      for (const file of files) {
        const filePath = path.resolve(RECORDS_PATH, file);

        console.log(`Reading SQL statements from ${filePath}`);
        const sqlStatements = (await fs.readFile(filePath, { encoding: 'utf-8' })).toString().split('\n');

        for (const statement of sqlStatements) {
          if (statement) {
            console.log(`[Executing] ${statement}`);
            await connection.execute(statement);
          }
        }
      }
    };

    await importData();
  } catch (err) {
    console.log(err);
  } finally {
    console.log('Closing RDS connection');
    await connection.end();
  }
};

main();
