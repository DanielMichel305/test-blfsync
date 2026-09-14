import { describe, expect, it } from 'vitest';
import { getFieldUpdateValidationErrors, type FieldUpdateValidationValues } from './fieldUpdateValidation';

const valid: FieldUpdateValidationValues = {
  title: 'A field report',
  tag: 'Hope',
  category: '',
  publishedAt: '',
  mdBody: 'Good news from the field.',
  mediaChoice: 'none',
  mediaUrl: '',
};

describe('field-update form validation', () => {
  it('returns every invalid field with an actionable suggestion', () => {
    const errors = getFieldUpdateValidationErrors({ ...valid, title: '', tag: '', mdBody: '', mediaChoice: 'url', mediaUrl: 'http://unsafe.example' }, false, []);

    expect(Object.keys(errors)).toEqual(['title', 'tag', 'mdBody', 'mediaUrl']);
    expect(errors.title).toMatch(/enter/i);
    expect(errors.mediaUrl).toContain('https://');
  });

  it('reports the exact invalid audience filter rows', () => {
    const errors = getFieldUpdateValidationErrors(valid, true, [
      { id: 'track', type: 'ministry-track-subscribers', trackId: '' },
      { id: 'roles', type: 'roles', roles: [] },
      { id: 'users', type: 'specific-users', userIds: [] },
    ]);

    expect(errors).toMatchObject({
      'filter-track': expect.stringMatching(/choose/i),
      'filter-roles': expect.stringMatching(/select/i),
      'filter-users': expect.stringMatching(/enter/i),
    });
  });

  it('returns no errors for valid values and a complete audience', () => {
    expect(getFieldUpdateValidationErrors(valid, true, [{ id: 'all', type: 'all-subscribers' }])).toEqual({});
  });
});
