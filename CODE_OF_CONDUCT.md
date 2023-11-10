# Code of Conduct

- These are the **guidelines** that have been agreed on, please try to abide by them.
- There will be many instances where our files do not conform to these standards, that is ok.
- You can refer to this github page for more best practices and standards to coding <https://google.github.io/styleguide/jsguide.html#source-file-basics>

---

## Folder/File Conventions

- **Folder** names should be kebab-lower-cased and plural
- **File** names should be descriptive
  - File names must be all lowercase and may include underscores (\_) or dashes (-), but no additional punctuation. Follow the convention that your project uses. Filenames’ extension must be .js or .ts.
  - fileSG will go with dashes (-) kebab-lower-cased

## Project Structure

- src folder should contain typescript related codes
  - commmon
    - shareable classes, interceptor, logger
  - config
    - database
    - app-config for the envs
  - migrations
    - records need to run to ensure database is insync
    - we can see test data here as well
  - modules
    - 3 categories of modules
    - setup
      - common configuration modules that forms the builidng block for features
    - entities
      - 1 module per database entity
      - the only modules that have direct access to entity repository
      - should contains the following files
        - module
        - service
        - repository
      - should NOT contain controller file
      - the methods in service file should only contain CRUD wrapper with minimal logics, method with custom logics specific to particular feature module should not be included here
    - feature
      - main FileSG features module
  - index.ts
    - the entry point
  - root-modules.ts
    - register all the modules, providers in the project
  - standalone
    - containing code that are to be ran independently of the application
      - cron jobs (e.g. expire-docs.cron.ts)
      - adhoc tasks (e.g. generate-swagger-doc.ts)
  - server.ts
    - configure aws
    - start swagger
    - start listening on port

## Coding Conventions

- Do not write chained conditional (ternary) operator
- While writing 'if' statement, do not write one-liner (without curly brackets)
- Do not use `await Promise.all(<Individual DD Query>)` if you are able to fetch/update everything in a single sql query
- Functions should generally have validation and early return at the start before the actual business logic

## Frontend React

- For components that need custom styling, always use `styled-components` for consistency across the project.

## Logging requirements

### Log Format

- To include both requestID and sessionID for easy troubleshooting
- To include userUuid regardless of web users or programmatic users

### Log Level and their content

#### ERROR

- Runtime errors will only be caught at exception filter
- Handled errors remains it is [logger.error(err)]
- tag [IssuanceFlow]to all document issuance errors
  - future expansion: to do log filter and alarms for this particular kind of errors

#### WARNING

- scenarios that does not result in a 4XX response
  - e.g. email not sent and it is not affecting the overall flow

#### INFO

- decorate function with @Function decorator to log down the current function name
- 3rd party integration request and response
  - redact sensitive information
- Metrics required for data analysis e.g. onboarding metrics
- Initialisation notices
  - msw server starting
  - start polling
- AWS operation
  - except SQS which should only be logged when received message
    - this is to prevent the polling logs from too overwhelming
- Redis operation
  - e.g. retrieving <KEY> or setting <KEY> without the values

#### DEBUG

- Printing of values for debugging purposes
  - This will not be shown in production

#### VERBOSE

- For debugging that should be removed at the end of troubleshooting session

## Definitions

- NULL - means that we do NOT know what the value is, it may exist, but it may not exist, we just don't know.
- Empty-String - means we know what the value is and that it is nothing.

## Notes

### Database

1. Use of optional(?) at entity class is to ensure checking of undefined to prevent runtime error due to not joining related tables
2. Model (created for use at repository and service level) with optional(?) serves a different purpose to allow optional parameters as there are given default values at the entity class
