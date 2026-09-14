import type { FieldUpdateAudienceFilter } from '../../api/fieldUpdateDelivery';

export interface FieldUpdateValidationValues {
  title: string;
  tag: string;
  category: string;
  publishedAt: string;
  mdBody: string;
  mediaChoice: 'keep' | 'none' | 'url' | 'upload';
  mediaUrl: string;
  media?: File;
}

export type FieldUpdateValidationErrors = Record<string, string>;

export function getFieldUpdateValidationErrors(form: FieldUpdateValidationValues, emailEnabled: boolean, filters: FieldUpdateAudienceFilter[]) {
  const errors: FieldUpdateValidationErrors = {};
  if (!form.title.trim()) errors.title = 'Enter a short, descriptive title.';
  else if (form.title.trim().length > 200) errors.title = `Shorten the title by ${form.title.trim().length - 200} characters.`;
  if (!form.tag.trim()) errors.tag = 'Enter a tag that helps readers identify the update.';
  else if (form.tag.trim().length > 100) errors.tag = `Shorten the tag by ${form.tag.trim().length - 100} characters.`;
  if (form.category.trim().length > 100) errors.category = `Shorten the category by ${form.category.trim().length - 100} characters.`;
  if (form.publishedAt && Number.isNaN(new Date(form.publishedAt).getTime())) errors.publishedAt = 'Choose a valid publication date and time.';
  if (!form.mdBody.trim()) errors.mdBody = 'Write the field update before saving.';
  else if (form.mdBody.length > 50_000) errors.mdBody = `Shorten the Markdown body by ${(form.mdBody.length - 50_000).toLocaleString()} characters.`;
  if (form.mediaChoice === 'url' && !/^https:\/\//i.test(form.mediaUrl.trim())) errors.mediaUrl = 'Use a complete secure URL beginning with https://.';
  if (form.mediaChoice === 'upload' && !form.media) errors.media = 'Choose an accepted image or video file from your device.';
  if (emailEnabled && filters.length === 0) errors.audience = 'Add at least one audience filter, or turn off email delivery.';
  if (emailEnabled) filters.forEach(filter => {
    if (filter.type === 'ministry-track-subscribers' && !filter.trackId) errors[`filter-${filter.id}`] = 'Choose the ministry track whose subscribers should be included.';
    if (filter.type === 'roles' && filter.roles.length === 0) errors[`filter-${filter.id}`] = 'Select at least one role for this audience filter.';
    if (filter.type === 'specific-users' && filter.userIds.length === 0) errors[`filter-${filter.id}`] = 'Enter at least one user ID, separated by commas.';
  });
  return errors;
}
