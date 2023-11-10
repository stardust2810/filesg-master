import { execSync } from 'child_process';
import { format } from 'date-fns';
import { copyFile, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { OpenAPIV3 } from 'openapi-types';
/**
 * TO update the following:
 *  - Release note inside (tech-doc-info-description.md)
 *  - Version Number
 */
const API_TITLE = 'FileSG API';
const API_VERSION = '1.2.0';
const FILESG_LOGO = 'https://www.dev.file.gov.sg/assets/images/icons/miscellaneous/fsglogo-wpadding.png';

const GENERATE_SWAGGER_CMD = 'npm run swagger:generate -- --with-aws-extension --tags=apigw --with-global-prefix';
const CURRENT_DIR = __dirname;
const ROOT_DIR = CURRENT_DIR.split('/').slice(0, -2).join('/');
const CORE_DIR = `${ROOT_DIR}/apps/service-core`;
const TRANSFER_DIR = `${ROOT_DIR}/apps/service-transfer`;
const BREAK_LINE = '-'.repeat(process.stdout.columns);

const MAIN_SWAGGER_FILE_NAME = 'swagger.json';
const WORKING_DIR = `${CURRENT_DIR}/${new Date().getTime()}`;
const SWAGGER_CORE_WD = `${WORKING_DIR}/swagger-core.json`;
const SWAGGER_TRANSFER_WD = `${WORKING_DIR}/swagger-transfer.json`;
const SWAGGER_DESCRIPTION_MD_FILE = `${CURRENT_DIR}/tech-doc-info-description.md`;
const ISSUANCE_TAG_DESCRIPTION = `${CURRENT_DIR}/issuance-tag-description.md`;
const SWAGGER_SERVERS = `${CURRENT_DIR}/server.json`;
const SWAGGER_FINAL = `${WORKING_DIR}/swagger-final.json`;

export const TECH_DOC_SWAGGER_PREFIX = 'tech-doc';

const logWithBreakLine = (logMessage: string) => {
  console.log(logMessage);
  console.log(BREAK_LINE);
};

const moveFile = async (src: string, dest: string) => {
  logWithBreakLine(`Copying ${src} to ${dest}.`);
  await copyFile(src, dest);

  logWithBreakLine(`Delete file from ${src}.`);
  await rm(src, { force: true });
};

const capitalizeFirstLetter = (word: string): string => {
  const [firstLetter, ...rest] = word;
  const caplitalizedFirstLetter = firstLetter.toUpperCase();
  const resultant = [caplitalizedFirstLetter, ...rest].join('');
  return resultant;
};

(async () => {
  try {
    console.log(`
    ██████  ███████ ███    ██ ███████ ██████   █████  ████████ ██ ███    ██  ██████      ████████ ███████  ██████ ██   ██     ██████   ██████   ██████ 
   ██       ██      ████   ██ ██      ██   ██ ██   ██    ██    ██ ████   ██ ██              ██    ██      ██      ██   ██     ██   ██ ██    ██ ██      
   ██   ███ █████   ██ ██  ██ █████   ██████  ███████    ██    ██ ██ ██  ██ ██   ███        ██    █████   ██      ███████     ██   ██ ██    ██ ██      
   ██    ██ ██      ██  ██ ██ ██      ██   ██ ██   ██    ██    ██ ██  ██ ██ ██    ██        ██    ██      ██      ██   ██     ██   ██ ██    ██ ██      
    ██████  ███████ ██   ████ ███████ ██   ██ ██   ██    ██    ██ ██   ████  ██████         ██    ███████  ██████ ██   ██     ██████   ██████   ██████ 
                                                                                                                                                       
                                                                                                                                                       
   `);
    logWithBreakLine('Creating working directory');
    await mkdir(WORKING_DIR);

    logWithBreakLine(`Generating service-core swagger.`);
    execSync(`cd ${CORE_DIR} && ${GENERATE_SWAGGER_CMD}`);

    await moveFile(`${CORE_DIR}/${MAIN_SWAGGER_FILE_NAME}`, SWAGGER_CORE_WD);

    logWithBreakLine(`Generating service-transfer swagger.`);
    execSync(`cd ${TRANSFER_DIR} && ${GENERATE_SWAGGER_CMD}`);

    await moveFile(`${TRANSFER_DIR}/${MAIN_SWAGGER_FILE_NAME}`, SWAGGER_TRANSFER_WD);

    console.log(`Merging swagger documents`);
    const coreDocs = JSON.parse(await readFile(SWAGGER_CORE_WD, 'utf-8')) as OpenAPIV3.Document;
    for (let key in coreDocs.paths) {
      console.log(key);
    }

    const transferDocs = JSON.parse(await readFile(SWAGGER_TRANSFER_WD, 'utf-8')) as OpenAPIV3.Document;

    coreDocs.paths = {
      ...coreDocs.paths,
      ...transferDocs.paths,
    };

    coreDocs.components!.schemas = {
      ...coreDocs.components!.schemas!,
      ...transferDocs.components!.schemas!,
    };

    coreDocs.components!.securitySchemes = {
      ...coreDocs.components!.securitySchemes!,
      ...transferDocs.components!.securitySchemes!,
    };

    logWithBreakLine(`Merge complete`);

    logWithBreakLine(`Updating swagger info`);
    const lastUpdatedAt = `Document last updated at: ${format(new Date(), 'do-MMMM-yyyy')} \n\n`;
    const description = lastUpdatedAt + (await readFile(SWAGGER_DESCRIPTION_MD_FILE, 'utf-8'));
    const info = {
      title: API_TITLE,
      version: API_VERSION,
      'x-logo': { url: FILESG_LOGO },
      description,
    };

    coreDocs.info = info;
    coreDocs.servers = JSON.parse(await readFile(SWAGGER_SERVERS, 'utf-8'));

    const tagsSet = new Set<string>();
    logWithBreakLine(`Updating swagger tags to name it as FileSG intead for apigw`);
    for (let key in coreDocs.paths) {
      const path = coreDocs.paths[key]!;
      for (let pathName in path) {
        const tags = (path as any)[pathName].tags as String[];
        const tagWithPrefix = tags.find((tag) => tag.includes(`${TECH_DOC_SWAGGER_PREFIX}:`));
        if (!tagWithPrefix) {
          throw Error(`Could not find a tag with prefix for ${pathName}`);
        }
        const tagName = capitalizeFirstLetter(tagWithPrefix.replace(`${TECH_DOC_SWAGGER_PREFIX}:`, ''));
        (path as any)[pathName].tags = [tagName];
        tagsSet.add(tagName);
      }
    }

    coreDocs.tags = [
      {
        name: 'Issuance',
        description: await readFile(ISSUANCE_TAG_DESCRIPTION, 'utf-8'),
      },
    ];

    (coreDocs as any)['x-tagGroups'] = [
      {
        name: 'API Definitions',
        tags: Array.from(tagsSet),
      },
    ];

    logWithBreakLine(`Writing final version to file`);
    await writeFile(SWAGGER_FINAL, JSON.stringify(coreDocs));

    await rm(SWAGGER_CORE_WD);
    await rm(SWAGGER_TRANSFER_WD);

    logWithBreakLine(`File available at ${SWAGGER_FINAL}`);
    console.log(`To preview the file run the following command`);
    logWithBreakLine(`npx @redocly/cli preview-docs ${SWAGGER_FINAL}`);

    console.log(`

    ██████  ██████  ███    ███ ██████  ██      ███████ ████████ ███████ ██████  
   ██      ██    ██ ████  ████ ██   ██ ██      ██         ██    ██      ██   ██ 
   ██      ██    ██ ██ ████ ██ ██████  ██      █████      ██    █████   ██   ██ 
   ██      ██    ██ ██  ██  ██ ██      ██      ██         ██    ██      ██   ██ 
    ██████  ██████  ██      ██ ██      ███████ ███████    ██    ███████ ██████`);
  } catch (err) {
    console.error(err);
    await rm(WORKING_DIR, { force: true, recursive: true });
  }
})();
