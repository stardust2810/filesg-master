import { Color } from '../styles/color';

export enum RESPONSIVE_VARIANT {
  SMALLER_THAN = 'smaller-than',
  SMALLER_OR_EQUAL_TO = 'smaller-or-equal-to',
  LARGER_THAN = 'larger-than',
  LARGER_OR_EQUAL_TO = 'larger-or-equal-to',
}

export enum FSG_DEVICES {
  SMALL_MOBILE = 'SMALL_MOBILE',
  MOBILE = 'MOBILE',
  SMALL_TABLET = 'SMALL_TABLET',
  NORMAL_TABLET_PORTRAIT = 'NORMAL_TABLET_PORTRAIT',
  NORMAL_TABLET_LANDSCAPE = 'NORMAL_TABLET_LANDSCAPE',
  SMALL_DESKTOP = 'SMALL_DESKTOP',
  NORMAL_DESKTOP = 'NORMAL_DESKTOP',
  LARGE_DESKTOP = 'LARGE_DESKTOP',
}

// Remove this and change the imports to the one in common after the configs are sorted out
export enum DATE_FORMAT_PATTERNS {
  DATE_COMMA_TIME = 'd MMM yyyy, h:mm a',
  DATE_TIME = 'd MMM yyyy h:mm a',
  OFFSET = "'GMT' XXX",
  DATE = 'd MMM yyyy',
  TIME = 'h:mm a',
  FULL_DATE = 'd MMMM yyyy',
  TRANSACTION_DATE = 'yyyyMMdd',
}

export const HEADER_MIN_HEIGHT = 60;

export enum TEST_IDS {
  TEXT = 'filesg-text',
  BUTTON = 'filesg-button',
  TEXT_BUTTON = 'filesg-text-button',
  LIST_BUTTON = 'filesg-list-button',
  LIST_BUTTON_CONTENT_CONTAINER = 'filesg-list-button-content-container',
  ICON_BUTTON = 'filesg-icon-button',
  SELECT = 'filesg-select',
  MENU_ITEM = 'filesg-menu-item',
  CHECKBOX = 'filesg-checkbox',
  FILE_ICON = 'filesg-file-icon',
  ICON = 'filesg-icon',
  ICON_LABEL = 'filesg-icon-label',
  FILE_LABEL = 'filesg-file-label',
  FILE_LABEL_DESCRIPITORS = 'filesg-file-label-descriptors',
  FILE_LABEL_ICON = 'filesg-file-label-icon',
  FILE_LABEL_TAG = 'filesg-file-label-tag',
  ALERT = 'filesg-alert',
  // Tag
  TAG = 'filesg-tag',
  TAG_TEXT = 'filesg-tag-text',
  //BREADCRUMB
  BREADCRUMB = 'filesg-breadcrumb',
  BREADCRUMB_ITEM = 'filesg-breadcrumb-item',
  BREADCRUMB_SEPARATOR = 'filesg-breadcrumb-separator',
  BREADCRUMB_COLLAPSOR = 'filesg-breadcrumb-collapsor',
  // MASTHEAD
  MASTHEAD = 'filesg-masthead',
  MASTHEAD_LINK = 'filesg-masthead-link',
  MASTHEAD_DROPDOWN_BUTTON = 'filesg-masthead-dropdown-btn',
  MASTHEAD_IDENTIFICATION_METHODS = 'filesg-masthead-identification-methods',
  //FOOTER
  FOOTER = 'filesg-footer',
  FOOTER_TOP_SECTION = 'filesg-footer-top-section',
  FOOTER_BOTTOM_SECTION = 'filesg-footer-bottom-section',
  //FILE_TABLE
  FILE_TABLE = 'filesg-file-table',
  FILE_TABLE_HEADER_ROW = 'filesg-file-table-row',
  FILE_TABLE_ROW = 'filesg-file-table-row',
  NAVIGATION_HEADER = 'filesg-navigation-header',
  NAVIGATION_LOGO = 'filesg-navigation-logo',
  SUBHEADER = 'filesg-subheader',
  //MODAL
  MODAL = 'filesg-modal',
  MODAL_BACKDROP = 'filesg-modal-backdrop',
  MODAL_CARD = 'filesg-modal-card',
  MODAL_HEADER = 'filesg-modal-header',
  MODAL_HEADER_TITLE = 'filesg-modal-header-title',
  MODAL_BODY = 'filesg-modal-body',
  MODAL_FOOTER = 'filesg-modal-footer',
  MODAL_CLOSE_BUTTON = 'filesg-modal-close-button',
  //LIST
  LIST = 'filesg-list',
  LIST_ITEM = 'filesg-list-item',
  LIST_NAVIGATION_ITEM = 'filesg-list-nav-item',
  LIST_ACTION_ITEM = 'filesg-list-action-item',
  //DRAWER/BACKDROP
  DRAWER = 'filesg-drawer',
  BACKDROP = 'filesg-backdrop',
  //CAROUSEL
  CAROUSEL = 'filesg-carousel',
  CAROUSEL_BUTTON = 'filesg-carousel-button',
  CAROUSEL_SLIDE = 'filesg-carousel-slide',
  CAROUSEL_PAGINATION = 'filesg-carousel-pagination',
  //DIVIDER
  DIVIDER = 'filesg-divider',
  //TOOLTIP
  TOOLTIP = 'filesg-tooltip',
  TOOLTIP_TEXT = 'filesg-tooltip-text',
  //INFO
  INFO = 'filesg-info',
  INFO_IMAGE = 'filesg-info-image',
  INFO_TITLE = 'filesg-info-title',
  INFO_DESCRIPTION = 'filesg-info-description',
  //DATEPICKER
  DATEPICKER = 'filesg-datepicker',
  DATEPICKER_DAY = 'filesg-datepicker-day',
  DATEPICKER_MONTH = 'filesg-datepicker-month',
  DATEPICKER_YEAR = 'filesg-datepicker-year',
  DATEPICKER_ERROR = 'filesg-datepicker-error',
  //PUBLIC_PAGE_HEADER
  PUBLIC_PAGE_HEADER = 'filesg-public-page-header',
  PUBLIC_PAGE_HEADER_TITLE = 'filesg-public-page-header-title',
  PUBLIC_PAGE_HEADER_DESCRIPTION = 'filesg-public-page-header-description',
  PUBLIC_PAGE_HEADER_IMAGE = 'filesg-public-page-header-image',
  //TEXT_INPUT
  TEXT_INPUT_LABEL = 'filesg-text-input-label',
  TEXT_INPUT_CONTAINER = 'filesg-text-input-container',
  TEXT_INPUT = 'filesg-text-input',
  TEXT_INPUT_ERROR_PROMPT = 'filesg-text-input-error-prompt',
  TEXT_INPUT_SUCCESS_PROMPT = 'filesg-text-input-success-prompt',
  //FILE_UPLOAD
  FILE_UPLOAD_DROPZONE = 'filesg-file-upload-dropzone',
  FILE_UPLOAD_DROPZONE_DESCRIPTION = 'filesg-file-upload-dropzone-description',
  //ACCORDION
  ACCORDION_LEVEL_1 = 'filesg-accordion-level-1',
  ACCORDION_LEVEL_1_HEADER = 'filesg-accordion-level-1-header',
  ACCORDION_LEVEL_1_CONTENT = 'filesg-accordion-level-1-content',
  ACCORDION_LEVEL_2 = 'filesg-accordion-level-2',
  ACCORDION_LEVEL_2_HEADER = 'filesg-accordion-level-2-header',
  ACCORDION_LEVEL_2_CONTENT = 'filesg-accordion-level-2-content',
  //HEADER
  HEADER = 'filesg-header',
  HEADER_NAV_LINK = 'filesg-header-nav-link',
  HEADER_ACTION_BUTTON = 'filesg-header-action-button',
  HEADER_MENU_BUTTON = 'filesg-header-menu-button',
  FILE_SPINNER = 'filesg-file-spinner',
  FILE_SPINNER_TEXT = 'filesg-file-spinner-text',
  SIDEBAR = 'filesg-sidebar',
  SIDE_NAV_MENU_ITEM = 'side-nav-menu-item',
  //ANNOUNCEMENT_BANNER
  ANNOUNCEMENT_BANNER = 'filesg-announcment-banner',
  ANNOUNCEMENT_BANNER_TITLE = 'filesg-announcment-banner-title',
  ANNOUNCEMENT_BANNER_DESCRIPTION = 'filesg-announcment-banner-description',
  ANNOUNCEMENT_BANNER_CLOSE_BUTTON = 'filesg-announcment-close-btn',
  // FSG LOGO
  FILESG_APP_LOGO = 'filesg-app-logo',
  // AVATAR
  AVATAR = 'filesg-avatar',
  AVATAR_IMAGE = 'filesg-avatar-image',
  // METADATA_LIST
  METADATA_LIST = 'filesg-metadata-list',
  METADATA_LIST_HEADER = 'filesg-metadata-list-header',
  METADATA_LIST_ITEM = 'filesg-metadata-list-item',
  METADATA_LIST_THUMBNAIL = 'filesg-metadata-list-thumbnail',
  // SPINNER
  SPINNER = 'filesg-spinner',
}

export enum FIELD_ERROR_IDS {
  DATEPICKER_FIELD_ERROR = 'filesg-datepicker-field-error',
  TEST_FIELD_ERROR = 'filesg-text-field-error',
}

export enum HEX_COLOR_OPACITY {
  P00 = '00',
  P10 = '1A',
  P20 = '33',
  P25 = '40',
  P30 = '4D',
  P40 = '66',
  P50 = '80',
  P60 = '99',
  P70 = 'B3',
  P80 = 'CC',
  P90 = 'E6',
  P100 = 'FF',
}

export const SKELETON_SPEED = 2;
export const SKELETON_FOREGROUND_COLOR = Color.GREY20;
export const SKELETON_BACKGROUND_COLOR = Color.GREY10;
export const Z_INDEX = {
  MODAL: 9998,
  TOAST: 9999,
};
