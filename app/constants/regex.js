export const regex = {
  FLOAT_REGEX: /^\d+\.?\d+$/g,
  INT_REGEX: /^\d+$/,
  NON_DIGIT_REGEX: /[\D]/g,
  NON_DIGIT_FLOAT_REGEX: /[^\d\.]/g,
  HK_MOBILE_NUMBER_REGEX: /^[456789]\d{7}/g,
  EMAIL_REGEX: /^[^@\s]+@[^@\s]+/g,
  SHIPMENT_ORDER_REGEX: /^\d{4,5}([A-Z]{1})?$/
};
