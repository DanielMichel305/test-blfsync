import { ApiError } from './client';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : fallback;

  const detail = error.message && error.message !== error.code ? ` ${error.message}` : '';
  if (error.status === 0) return 'The service could not be reached. Check your connection and try again.';
  if (error.status === 400) return `Some information is invalid. Review the form and try again.${detail}`;
  if (error.status === 401) return 'Your session has expired. Sign in and try again.';
  if (error.status === 403) return 'You do not have permission to perform this action.';
  if (error.status === 404) return 'This field update could not be found.';
  if (error.status === 409) return `This update changed or its current status prevents that action.${detail}`;
  if (error.status >= 500) return 'The service encountered an error. Please try again.';
  return error.message || fallback;
}
