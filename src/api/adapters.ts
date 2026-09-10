import type { components } from './generated';
import type { AppNotification, Badge, Donor, Track, UpdateFeed } from '../types';

type S = components['schemas'];

export type PrayerThreadDisplay = Omit<S['PrayerWallThread'], 'author'> & {
  authorId?: string;
  authorName: string;
  authorAvatarUrl?: string;
};

export type PrayerCommentDisplay = Omit<S['PrayerWallComment'], 'author'> & {
  authorId?: string;
  authorName: string;
  authorAvatarUrl?: string;
};

function publicAuthorName(author: S['PublicAuthor'], anonymousName?: string | null) {
  if (!author) return anonymousName || 'Anonymous';
  return [author.firstName, author.lastName].filter(Boolean).join(' ');
}

export function userToDonor(user: S['User']): Donor {
  return {
    donor_id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(' '),
    email: user.email,
    join_date: user.createdAt,
    avatar_url: user.profilePictureUrl || undefined,
    role: user.role === 'admin' ? 'admin' : 'donor',
    api_role: user.role,
  };
}

export function ministryTrackToTrack(track: S['MinistryTrack'], index = 0): Track {
  return {
    track_id: track.id,
    name: track.name,
    target_unit_label: track.metricUnit,
    annual_target: track.target_metric_level,
    min_monthly_gift: track.min_monthly_contribution,
    cost_per_unit: track.cost_per_unit,
    current_raised: track.current_metric_level,
    description: track.description,
    icon: 'Heart',
    letter: String.fromCharCode(65 + (track.order ?? index)),
    cover_url: track.cover_url,
    target_period: track.target_period,
    is_active: track.isActive,
  };
}

export function publicMinistryTrackToTrack(track: S['PublicMinistryTrack'], index = 0): Track {
  const targetPeriod = ['Monthly', 'Quarterly', 'Annually'].includes(track.target_period) ? track.target_period as Track['target_period'] : 'Annually';
  return {
    track_id: track.id,
    name: track.name,
    target_unit_label: track.metricUnit,
    annual_target: track.target_metric_level,
    min_monthly_gift: track.min_monthly_contribution,
    cost_per_unit: track.cost_per_unit,
    current_raised: track.current_metric_level,
    description: track.description,
    icon: 'Heart',
    letter: String.fromCharCode(65 + index),
    cover_url: track.cover_url,
    target_period: targetPeriod,
    is_active: track.isActive,
  };
}

export function userBadgeToBadge(badge: S['UserBadge'], userId: string): Badge {
  return {
    badge_id: badge.id,
    donor_id: userId,
    badge_type: badge.code,
    name: badge.name,
    description: badge.description,
  };
}

export function notificationToDisplay(notification: S['NotificationFeedItem'], userId: string): AppNotification {
  return {
    notification_id: notification.id,
    donor_id: userId,
    title: notification.title,
    message: notification.body,
    date: notification.createdAt,
    read: !!notification.readAt,
    type: 'general',
  };
}

export function announcementToUpdate(announcement: S['Announcement']): UpdateFeed {
  return {
    post_id: announcement.id,
    title: announcement.title,
    content: announcement.description,
    publish_date: announcement.startsAt || announcement.createdAt,
    category: announcement.type,
  };
}

export function testimonyToUpdate(testimony: S['Testimony']): UpdateFeed {
  return {
    post_id: testimony.id,
    title: testimony.authorName,
    content: testimony.quote,
    media_url: testimony.coverImageUrl || undefined,
    publish_date: testimony.testimonyDate || testimony.createdAt,
    category: testimony.track?.name || 'Testimony',
  };
}

export function prayerThreadToDisplay(thread: S['PrayerWallThread']): PrayerThreadDisplay {
  return {
    ...thread,
    authorId: thread.author?.id,
    authorName: publicAuthorName(thread.author, thread.authorDisplayName),
    authorAvatarUrl: thread.author?.profilePictureUrl || undefined,
  };
}

export function prayerCommentToDisplay(comment: S['PrayerWallComment']): PrayerCommentDisplay {
  return {
    ...comment,
    authorId: comment.author?.id,
    authorName: publicAuthorName(comment.author, comment.authorDisplayName),
    authorAvatarUrl: comment.author?.profilePictureUrl || undefined,
  };
}
