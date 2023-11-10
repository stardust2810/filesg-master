import { validateSync } from 'class-validator';

import { UpdateRecipientInfoRequest } from '../request';

const EMAIL_VALIDATION_ERROR_MESSAGE = 'email must be an email or null';
const DOB_SHOULD_NOT_BE_UNDEFINED_ERROR_MESSAGE = 'dob must be a valid date or null';
const CONTACT_SHOULD_NOT_BE_UNDEFINED_ERROR_MESSAGE = 'contact must be a valid SG mobile or null';
const DOB_SHOULD_BE_NULL_VALIDATION_ERROR_MESSAGE = 'dob must be null when mobile number is null';
const DOB_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE =
  'dob must be valid, less than or equal to current date, and in the format of (yyyy-mm-dd) when mobile number is not null';
const CONTACT_SHOULD_BE_NULL_VALIDATION_ERROR_MESSAGE = 'mobile number must be null when dob is null';
const CONTACT_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE =
  'contact must be a valid Singapore mobile (e.g. +6581234567) when dob is not null';
describe('UpdateRecipientInfoRequest validation', () => {
  it('missing email contact, dob properties should have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();

    const validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(3);
    expect(JSON.stringify(validationResult)).toContain(EMAIL_VALIDATION_ERROR_MESSAGE);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_NOT_BE_UNDEFINED_ERROR_MESSAGE);
    expect(JSON.stringify(validationResult)).toContain(CONTACT_SHOULD_NOT_BE_UNDEFINED_ERROR_MESSAGE);
  });

  it('null email, contact and dob should not have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = null;
    updateRecipientInfoRequest.contact = null;
    updateRecipientInfoRequest.dob = null;

    const validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(0);
  });

  it('empty email, contact and dob should have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = '';
    updateRecipientInfoRequest.contact = '';
    updateRecipientInfoRequest.dob = '';

    const validationResult = validateSync(updateRecipientInfoRequest);
    expect(validationResult.length).toEqual(3);
    expect(JSON.stringify(validationResult)).toContain(EMAIL_VALIDATION_ERROR_MESSAGE);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);
    expect(JSON.stringify(validationResult)).toContain(CONTACT_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);
  });

  it('non email compliant email should have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = 'helloworld';
    updateRecipientInfoRequest.contact = '+6598765432';
    updateRecipientInfoRequest.dob = '2022-01-01';

    const validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(EMAIL_VALIDATION_ERROR_MESSAGE);
  });

  it('non mobile number compliant contact should have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = 'dummy@gmail.com';
    updateRecipientInfoRequest.contact = '98765432';
    updateRecipientInfoRequest.dob = '2022-01-01';

    const validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(CONTACT_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);
  });

  it('non dob compliant dates should have validation errors', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = 'dummy@gmail.com';
    updateRecipientInfoRequest.contact = '+6598765432';
    updateRecipientInfoRequest.dob = '2026-01-01';

    let validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);

    updateRecipientInfoRequest.dob = '01-01-2021';
    validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);

    updateRecipientInfoRequest.dob = '2021-13-12';
    validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_NOT_BE_NULL_VALIDATION_ERROR_MESSAGE);
  });

  it('correct properties should not have validation error', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = 'dummy@gmail.com';
    updateRecipientInfoRequest.contact = '+6598765432';
    updateRecipientInfoRequest.dob = '2023-00-00';

    const validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(0);
  });

  it('dob and mobile should have validation error when either one is missing', () => {
    const updateRecipientInfoRequest = new UpdateRecipientInfoRequest();
    updateRecipientInfoRequest.email = 'dummy@gmail.com';
    updateRecipientInfoRequest.contact = '+6598765432';
    updateRecipientInfoRequest.dob = null;

    let validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(CONTACT_SHOULD_BE_NULL_VALIDATION_ERROR_MESSAGE);

    updateRecipientInfoRequest.contact = null;
    updateRecipientInfoRequest.dob = '2022-00-00';
    validationResult = validateSync(updateRecipientInfoRequest);

    expect(validationResult.length).toEqual(1);
    expect(JSON.stringify(validationResult)).toContain(DOB_SHOULD_BE_NULL_VALIDATION_ERROR_MESSAGE);
  });
});
