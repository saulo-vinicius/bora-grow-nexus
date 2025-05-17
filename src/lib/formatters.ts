
/**
 * Converts comma to dot in a string for decimal input handling
 * @param value The string value that may contain comma as decimal separator
 * @returns The string with comma replaced by dot
 */
export const formatDecimal = (value: string): string => {
  return value.replace(',', '.');
};

/**
 * Converts a string to a number, handling comma as decimal separator
 * @param value The string value to parse
 * @returns The parsed number or 0 if invalid
 */
export const parseDecimalInput = (value: string): number => {
  if (!value) return 0;
  const formattedValue = formatDecimal(value);
  const parsedValue = parseFloat(formattedValue);
  return isNaN(parsedValue) ? 0 : parsedValue;
};

/**
 * Checks if a value is a valid decimal number (with comma or dot)
 * @param value The string to check
 * @returns True if the value is a valid decimal number
 */
export const isValidDecimal = (value: string): boolean => {
  // Allow empty string
  if (!value) return true;
  
  // Replace comma with dot for validation
  const formattedValue = formatDecimal(value);
  
  // Check if the value is a valid decimal number
  return /^-?\d*\.?\d*$/.test(formattedValue);
};
