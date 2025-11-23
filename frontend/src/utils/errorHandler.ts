/**
 * Format API error message for display
 * Handles both string errors and Pydantic validation error arrays
 */
export const formatErrorMessage = (error: any, defaultMessage: string = 'Произошла ошибка'): string => {
  // If error.response?.data?.detail exists
  const detail = error?.response?.data?.detail;

  if (!detail) {
    return defaultMessage;
  }

  // If detail is a string, return it directly
  if (typeof detail === 'string') {
    return detail;
  }

  // If detail is an array of validation errors (Pydantic format)
  if (Array.isArray(detail)) {
    // Extract error messages from validation errors
    const messages = detail.map((err: any) => {
      if (typeof err === 'string') {
        return err;
      }

      // Pydantic error format: {type, loc, msg, input}
      if (err.msg) {
        const field = Array.isArray(err.loc) ? err.loc.join(' -> ') : '';
        return field ? `${field}: ${err.msg}` : err.msg;
      }

      return JSON.stringify(err);
    });

    return messages.join('; ');
  }

  // If detail is an object
  if (typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return defaultMessage;
};
