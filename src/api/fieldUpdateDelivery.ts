export type FieldUpdateAudienceFilter =
  | { id: string; type: 'ministry-track-subscribers'; trackId: string }
  | { id: string; type: 'all-subscribers' }
  | { id: string; type: 'all-users' }
  | { id: string; type: 'roles'; roles: Array<'admin' | 'family' | 'friend'> }
  | { id: string; type: 'specific-users'; userIds: string[] };

export interface FieldUpdateDeliveryAudience {
  semantics: 'union';
  filters: FieldUpdateAudienceFilter[];
}

export interface FieldUpdateDeliveryRequest {
  fieldUpdateId: string;
  audience: FieldUpdateDeliveryAudience;
}

export const fieldUpdateDeliveryAdapter = {
  async getRecipientCount(_audience: FieldUpdateDeliveryAudience): Promise<null> {
    return null;
  },
  async publish(_request: FieldUpdateDeliveryRequest) {
    return {
      delivered: false as const,
      recipientCount: null,
      message: 'Email delivery is not connected; no email was sent.',
    };
  },
};
