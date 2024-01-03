import { Color, IListItem } from '@filesg/design-system';
import { fromUnixTime } from 'date-fns';

import { config } from '../config/app-config';

export enum ThemeMode {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum WebPage {
  // Auth
  ROOT = '/',
  LOGOUT = '/logout',
  REDIRECT = '/redirect',
  SINGPASS_AUTHCALLBACK = '/singpass/auth-callback',
  CORPPASS_AUTHCALLBACK = '/corppass/auth-callback',
  MOCK_SINGPASS_AUTHCALLBACK = '/singpass/mock-auth-callback',
  MOCK_CORPPASS_AUTHCALLBACK = '/corppass/mock-auth-callback',
  ICA_SSO_CALLBACK = '/ica-sso-callback',
  // Prelogin
  ONBOARDING = '/onboarding',
  // Protected
  HOME = '/home',
  ACTIVITIES = '/activities',
  FILES = '/files',
  DOCUMENTS = '/documents',
  PROFILE = '/profile',
  // Public
  RETRIEVE = '/retrieve',
  PUBLIC = '/for-individuals',
  AGENCIES = '/for-agencies',
  OA_DOCUMENT_VIEWER = '/view',
  OA_DOCUMENT_VERIFIER = '/verify',
  HELP_CENTRE = '/help',
  ABOUT = '/about',
  FAQ = '/faq',
  PRIVACY_STATEMENT = '/privacy-statement',
  TERMS_OF_USE = '/terms-of-use',
  VERIFY = '/verify',
  BROWSER_NOT_SUPPORTED = '/browser-not-supported',

  //error
  SERVER_ERROR = '/server-error',

  // faq
  ABOUT_FILESG = '/about-filesg',
  RETRIEVING_YOUR_DOCUMENTS = '/retrieving-your-documents',
  FILE_TYPE_AND_FORMAT = '/file-type-and-format',
  DIGITAL_PASSES = '/digital-passes',
  RETRIEVING_BUSINESS_DOCUMENTS = '/retrieving-business-documents',
}

export enum ExternalLink {
  REPORT_VULNERABILITY = 'https://www.tech.gov.sg/report_vulnerability/',
  CONTACT_US = 'https://go.gov.sg/filesg-contact-us',
  BETA_SIGN_UP = 'https://go.gov.sg/filesg-user-research',
  PRODUCT_FEEDBACK = 'https://go.gov.sg/filesg-feedback',
  INDICATE_INTEREST = 'https://go.gov.sg/filesg-indication-of-interest',
  SINGPASS = 'https://www.singpass.gov.sg/',
}

export const SIDEBAR_ITEMS: IListItem[] = [
  {
    label: 'Home',
    to: WebPage.HOME,
  },
  {
    label: 'All Activities',
    to: WebPage.ACTIVITIES,
  },
  {
    label: 'My Files',
    to: WebPage.FILES,
    dropdowns: [
      {
        label: 'Issued',
        ariaLabel: 'Files issued to me',
        to: WebPage.FILES,
        icon: 'sgds-icon-file-alt',
        iconPosition: 'START',
      },
    ],
  },
];

export enum QueryKey {
  LOGIN = 'login',
  LOGIN_CONTEXT = 'login-context',
  LOGIN_REDIRECT = 'login-redirect',
  CHECK_USER = 'check-user',
  FILES = 'files',
  DOWNLOAD = 'download',
  DOWNLOAD_FILE = 'download-file',
  FILE_HISTORY = 'file-history',
  ACTIVITIES = 'activities',
  ACTIVITY = 'activity',
  GET_USER_SESSION_DETAILS = 'get-user-session-details',
  CONFIG = 'config',
  AGENCY_REDIRECT = 'agency-redirect',
  NON_SINGPASS = 'non-singpass',
  GET_USER_DETAILS = 'get-profile-details',
  ACTIVITY_RETRIEVAL_OPTIONS = 'activity-retrieval-options',
  VALIDATE_ACTIVITY = 'validate-activity',
  MY_INFO = 'my-info',
  VERIFY = 'verify',
  VERIFY_FILE_DOWNLOAD = 'verify-file-download',
  DNS_DID_RECORDS = 'dns-did-records',
  VERIFY_IDENTITY_PROOF_LOCATION = 'verify-identity-proof-location',
  USER_DOWNLOAD_EVENT = 'user-file-download',
}

export enum TEST_IDS {
  // ===========================================================================
  // Components
  // ===========================================================================
  // Data-display
  TEXT_LINK = 'text-link',
  ACTIVITY = 'activity',
  ACTIVITY_TITLE = 'activity-title',
  ACTIVITY_SKELETON = 'activity-skeleton',
  AGENCY_DATE_TIME = 'agency-date-time',
  BOTTOM_SHEET_TAB = 'bottom-sheet-tab',
  ERROR_INFO = 'error-info',
  RIGHT_SIDE_BAR = 'right-side-bar',
  STATUS_TAG = 'status-tag',
  TEXT_INFO = 'text-info',

  // Input
  PROFILE_NAME_FIELD = 'profile-name-field',
  PROFILE_UIN_FIELD = 'profile-uin-field',
  PROFILE_EMAIL_FIELD = 'profile-email-field',
  PROFILE_MOBILE_FIELD = 'profile-mobile-field',
  PROFILE_CORPORATE_NAME_FIELD = 'profile-corporate-name-field',
  PROFILE_CORPORATE_UEN_FIELD = 'profile-corporate-uen-field',
  PROFILE_ACCESS_DETAILS_FILED = 'profile-access-details-field',

  // Feedback
  AUTH_OPTION_MODAL_SINGPASS_BUTTON = 'auth-option-modal-singpass-button',
  AUTH_OPTION_MODAL_SINGPASS_OPTION_DESCRIPTION = 'auth-option-modal-singpass-option-description',
  NON_SINGPASS_BUTTON = 'auth-option-modal-non-singpass-button',
  NON_SINGPASS_OPTION_DESCRIPTION = 'auth-option-modal-non-singpass-option-description',
  CORPPASS_BUTTON = 'auth-option-modal-corppass-button',
  CORPPASS_OPTION_DESCRIPTION = 'auth-option-modal-corppass-option-description',
  AUTH_OPTION_MODAL_MOCK_LOGIN_BUTTON = 'auth-option-modal-mock-login-button',
  NON_SINGPASS_MODAL_VERIFY_BUTTON = 'non-singpass-modal-verify-button',
  NON_SINGPASS_MODAL_BACK_BUTTON = 'non-singpass-modal-back-button',
  NON_SINGPASS_MODAL_FIN_NRIC_INPUT = 'non-singpass-modal-fin-nric-input',
  NON_SINGPASS_MODAL_FIN_NRIC_INPUT_VALIDATION_ERROR = 'non-singpass-modal-fin-nric-input-validation-error',
  NON_SINGPASS_MODAL_DATEPICKER_INPUT_VALIDATION_ERROR = 'non-singpass-modal-datepicker-input-validation-error',
  NON_SINGPASS_MODAL_VERIFICATION_ATTEMPT_FAILED_NOTIFICATION = 'non-singpass-modal-verification-attempt-failed',
  NON_SINGPASS_MODAL_MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_NOTIFICATION = 'non-singpass-modal-maximum-verification-attempts-failed',
  ACTIVITY_ID_INPUT = 'non-singpass-modal-activity-id-input',
  INFORMATION_MODAL = 'information-modal',
  ACTION_BAR_SKELETON = 'action-bar-skeleton',
  ITEM_DETAILS_SKELETON = 'file-detail-skeleton',
  PAGE_DESCRIPTORS_SKELETON = 'page-descriptors-skeleton',
  INFO_SKELETON = 'info-skeleton',
  AGENCY_FILTER_MODAL_CLEAR_FILTER_BUTTON = 'agency-filter-modal-clear-filter-button',
  AGENCY_FILTER_MODAL_APPLY_FILTER_BUTTON = 'agency-filter-modal-apply-filter-button',
  CORPPASS_FIRST_LOGIN_INFORMATION_MODAL = 'corppass-first-login-information-modal',
  CORPPASS_FIRST_LOGIN_INFORMATION_MODAL_GET_STARTED_BUTTON = 'corppass-first-login-information-modal-get-started-button',

  // Navigation
  DOCUMENT_HEADER_SKELETON = 'document-header-skeleton',
  LEFT_SIDE_NAV = 'left-side-nav',
  TABS = 'tabs',
  TAB_TITLE = 'tab-title',
  TAB_HEADER_SKELETON = 'tab-header-skeleton',

  // ===========================================================================
  // Pages
  // ===========================================================================
  // Activity
  ACTIVITY_PAGE_SKELETON = 'activity-page-skeleton',
  ACTIVITY_INFO_SECTION = 'activity-info-section',
  ACTIVITY_ADDITIONAL_INFO = 'activity-additional-info',
  ACTIVITY_FILES = 'activity-files',
  ACTIVITY_FILES_ITEM = 'activity-files-item',
  // Files
  ACKNOWLEDGEMENT_TAG = 'acknowledgement-tag',
  ACKNOWLEDGEMENT_TAG_TOOLTIP = 'acknowledgement-tag-tooltip',

  // Document
  DOWNLOAD_FILE_BUTTON = 'download-file-button',
  PRINT_FILE_BUTTON = 'print-file-button',
  BOTTOM_SHEET_DOWNLOAD_FILE_BUTTON = 'bottom-sheet-download-file-button',
  BOTTOM_SHEET_PRINT_FILE_BUTTON = 'bottom-sheet-print-file-button',

  // Acknowledgement
  ACKNOWLEDGEMENT_BANNER = 'acknowledgement-banner',
  OPEN_ACKNOWLEDGEMENT_MODAL_BUTTON = 'open-acknowledgement-modal-button',
  CONFIRM_ACKNOWLEDGEMENT_BUTTON = 'confirm-acknowledgement-button',
  CANCEL_ACKNOWLEDGEMENT_BUTTON = 'cancel-acknowledgement-button',

  // FILE_DETAILS
  FILE_DETAILS = 'file-details',
  FILE_DETAILS_HEADER = 'file-details-header',
  FILE_DETAILS_ITEM = 'file-details-item',
  FILE_PREVIEW = 'file-preview',
}

// =============================================================================
// Layout defaults
// =============================================================================

export const FILESG_PAGE_TITLE = 'FileSG';

// Headers
export const MASTHEAD_HEIGHT = 28;

export const HEADER_HEIGHT = 88;
export const MOBILE_HEADER_HEIGHT = 60;

export const DOCUMENT_VIEW_HEADER_HEIGHT = 72;
export const MOBILE_DOCUMENT_VIEW_HEADER_HEIGHT = 48;

// Right sidebar
export const RIGHT_SIDEBAR_WIDTH = 320;

// Footers
export const ONBOARDING_FOOTER_HEIGHT = 80;
export const ONBOARDING_FOOTER_HEIGHT_MOBILE = 72;

// Page descriptors
export const PAGE_DESCRIPTOR_CONTAINER_HEIGHT = 112;
export const PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE = 132;

// Bottom Sheet
export const MOBILE_BOTTOM_SHEET_TAB_HEIGHT = 48;
export const TABLET_BOTTOM_SHEET_TAB_HEIGHT = 56;

export const FOOTER_DETAILS = {
  title: 'FileSG',
  description:
    'FileSG is a secure digital document management platform that allows members of the public to easily access and download documents issued by the government.',
  updatedDate: fromUnixTime(config.lastBuiltAt),
  footerBackgrdColor: Color.BLACK,
};

export const FOOTER_SITEMAP_LINKS = [
  {
    label: 'Retrieve',
    to: WebPage.RETRIEVE,
  },
  {
    label: 'Verify',
    to: WebPage.VERIFY,
  },
];

export const FOOTER_TOP_SECTION_LINKS = [
  {
    label: 'Frequently Asked Questions',
    to: WebPage.FAQ,
  },
  {
    label: 'Contact Us',
    to: ExternalLink.CONTACT_US,
    external: true,
  },
];

export const FOOTER_BOTTOM_SECTION_LINKS = [
  {
    label: 'Report Vulnerability',
    to: ExternalLink.REPORT_VULNERABILITY,
    external: true,
  },
  {
    label: 'Privacy Statement',
    to: WebPage.PRIVACY_STATEMENT,
  },
  {
    label: 'Terms of Use',
    to: WebPage.TERMS_OF_USE,
  },
];

// =============================================================================
// Page constants
// =============================================================================

export const MINIMUM_LOAD_DELAY_IN_MILLISECONDS = 700;
export const OTP_RESEND_BUFFER_SECONDS = 2;
export const DELAY_IN_SHOWING_LOADING_MS = 500;

// =============================================================================
// Session storage constants
// =============================================================================

export const REDIRECTION_PATH_KEY = 'redirectionPath';

// =============================================================================
// Query param constants (For activities and files page)
// =============================================================================

export const AGENCY_CODE_FILTER_PARAM_KEY = 'agencyCode';
