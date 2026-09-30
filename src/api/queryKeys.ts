export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: ['auth', 'session'] as const,
    profile: ['auth', 'profile'] as const,
    invitation: (token: string) => ['auth', 'invitation', token] as const,
  },
  tracks: {
    all: ['ministry-tracks'] as const,
    list: (params: unknown = {}) => ['ministry-tracks', 'list', params] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (params: unknown = {}) => ['subscriptions', 'list', params] as const,
    detail: (id: string) => ['subscriptions', 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (params: unknown = {}) => ['payments', 'list', params] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },
  referrals: {
    all: ['referrals'] as const,
    list: (params: unknown = {}) => ['referrals', 'list', params] as const,
    detail: (id: string) => ['referrals', 'detail', id] as const,
  },
  public: {
    all: ['public'] as const,
    tracks: (params: unknown = {}) => ['public', 'ministry-tracks', params] as const,
    announcements: (params: unknown = {}) => ['public', 'announcements', params] as const,
    testimonies: (params: unknown = {}) => ['public', 'testimonies', params] as const,
  },
  fieldUpdates: {
    all: ['field-updates'] as const,
    lists: () => ['field-updates', 'list'] as const,
    userList: (params: unknown = {}) => ['field-updates', 'list', 'user', params] as const,
    details: () => ['field-updates', 'detail'] as const,
    detail: (id: string) => ['field-updates', 'detail', id] as const,
  },
  badges: {
    all: ['badges'] as const,
    user: (id: string) => ['badges', 'user', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    feed: (params: unknown = {}) => ['notifications', 'feed', params] as const,
  },
  prayerWall: {
    all: ['prayer-wall'] as const,
    list: (params: unknown = {}) => ['prayer-wall', 'list', params] as const,
    detail: (id: string, params: unknown = {}) => ['prayer-wall', 'detail', id, params] as const,
    comments: (id: string, params: unknown = {}) => ['prayer-wall', id, 'comments', params] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    feed: (params: unknown = {}) => ['announcements', 'feed', params] as const,
  },
  testimonies: {
    all: ['testimonies'] as const,
    feed: (params: unknown = {}) => ['testimonies', 'feed', params] as const,
  },
};
