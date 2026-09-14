import { describe, expect, it } from 'vitest';
import { ApiError } from './client';
import { getApiErrorMessage } from './errors';
import { fieldUpdateDeliveryAdapter, type FieldUpdateDeliveryAudience } from './fieldUpdateDelivery';

describe('field-update integration boundaries', () => {
  it('formats validation, authorization, conflict, and server errors distinctly', () => {
    expect(getApiErrorMessage(new ApiError(400, 'Bad title'))).toMatch(/invalid/i);
    expect(getApiErrorMessage(new ApiError(403, 'Forbidden'))).toMatch(/permission/i);
    expect(getApiErrorMessage(new ApiError(409, 'Already archived'))).toMatch(/status/i);
    expect(getApiErrorMessage(new ApiError(500, 'Failure'))).toMatch(/service/i);
  });

  it('keeps composable audiences union-based and the delivery adapter explicitly unavailable', async () => {
    const audience: FieldUpdateDeliveryAudience = {
      semantics: 'union',
      filters: [
        { id: 'one', type: 'all-subscribers' },
        { id: 'two', type: 'roles', roles: ['family', 'friend'] },
      ],
    };

    expect(await fieldUpdateDeliveryAdapter.getRecipientCount(audience)).toBeNull();
    await expect(fieldUpdateDeliveryAdapter.publish({ fieldUpdateId: 'update-id', audience })).resolves.toMatchObject({ delivered: false, recipientCount: null });
  });
});
